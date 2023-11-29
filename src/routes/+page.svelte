<script lang="ts">
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import { pageViewModel } from './PageViewModel'
  import type { GraphData, Link, Node } from '../network/GraphData'
  import Banner, { Label, CloseReason } from '@smui/banner'
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import Textfield, { Input } from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'
  import Button from '@smui/button'
  import Checkbox from '@smui/checkbox'
  import FormField from '@smui/form-field'

  let address: string = ''
  let rune: string = ''
  let useTls: boolean = false
  let svg: any
  let g: any

  let connectionStatus = pageViewModel.getConnectionStatus()
  let graphData: GraphData

  let nodeRadius = 100
  let markerWidth = 6
  let markerHeight = 6
  let color = d3.scaleOrdinal(d3.schemeCategory10)

  $: if (graphData !== undefined) {
    updateGraph(graphData)
  }

  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

  onMount(async () => {
    // append the svg object to the body of the page
    svg = d3.selectAll('div.content').append('svg').attr('width', '100%').attr('height', '100%')

    g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    svg.call(
      d3.zoom().on('zoom', (event: { transform: any }) => {
        g.attr('transform', event.transform)
      })
    )

    svg
      .append('defs')
      .selectAll('marker')
      .data(['end'])
      .enter()
      .append('marker')
      .attr('id', 'end')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', markerWidth)
      .attr('markerHeight', markerHeight)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0, -5L10,0L0,5')
      .attr('fill', '#aaa')

    let graphDataObserver = {
      next: (data: GraphData | null) => {
        if (data !== null) {
          console.log('GraphData: next ', data)
          updateGraph(data)
        } else {
          console.log('Currently no GraphData available')
        }
      },
      error: (error: any) => {
        console.error('There was an error retrieving the GraphData:', error)
      },
      complete: () => {
        console.log('GraphData Observable completed')
      }
    }
    pageViewModel.getGraphData().subscribe(graphDataObserver)
  })

  function updateGraph(data: GraphData) {
    //remove existing nodes and links
    g.selectAll('.node').remove()
    g.selectAll('.link').remove()
    g.selectAll('path').remove()
    svg.selectAll('defs').remove()

    //now draw
    var defs = svg.append('svg:defs')

    data.links.forEach((link, index) => {
      defs
        .append('svg:marker')
        .attr('id', 'arrowhead' + index)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000000') // Apply color to the marker
    })

    var link = g
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('path')
      .attr('class', function (d) {
        return 'link-source=-' + d.source.id + ' target-' + d.target.id
      })
      .attr('d', pathD)
      .attr('fill', 'none')
      .style('stroke-width', '6px')
      .attr('marker-end', (d, i) => 'url(#arrowhead' + i + ')') // Apply the marker to the path
      .style('stroke', '#000000')

    var node = g.selectAll('.node').data(data.nodes).enter().append('g').attr('class', 'node')

    node
      .append('circle')
      .attr('r', nodeRadius)
      .style('fill', function (d: Node, i: number) {
        return color(d.color)
      })

    node
      .append('text')
      .text(function (d: Node) {
        return d.name
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '15px')
      .attr('fill', '#ffffff')

    var simulation = d3
      .forceSimulation(data.nodes)
      .force(
        'link',
        d3
          .forceLink()
          .id(function (d) {
            return d.id
          })
          .links(data.links)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(200))
      .on('tick', ticked)

    function ticked() {
      link.attr('d', pathD)

      node.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')'
      })

      node.selectAll('text').call(wrap, 150)
    }

    function pathD(d) {
      const dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        angle0 = Math.atan2(dy, dx),
        arrowLength = 37

      const x1 = d.source.x + Math.cos(angle0) * (nodeRadius + arrowLength),
        y1 = d.source.y + Math.sin(angle0) * (nodeRadius + arrowLength),
        x2 = d.target.x - Math.cos(angle0) * (nodeRadius + arrowLength),
        y2 = d.target.y - Math.sin(angle0) * (nodeRadius + arrowLength)

      return `M${x1},${y1}L${x2},${y2}`
    }

    function wrap(text: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, width: number) {
      text.each(function () {
        var text = d3.select(this),
          words = Array.from(text.text()),
          word,
          line: {}[] = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr('y'),
          dy = parseFloat(text.attr('dy') || '0'),
          tspan = text
            .text(null)
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', dy + 'em')

        while ((word = words.shift())) {
          line.push(word)
          tspan.text(line.join(''))
          if ((tspan.node() as SVGTextContentElement).getComputedTextLength() > width) {
            line.pop()
            tspan.text(line.join(''))
            line = [word]
            tspan = text
              .append('tspan')
              .attr('x', 0)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word)
          }
        }
      })
    }
  }

  function executeConnect() {
    pageViewModel.connect(address, rune, useTls)
  }
</script>

<main class="flex flex-col h-screen">
  <TopAppBar class="z-50 customTopBar sticky top-0" variant="static">
    <Row>
      <Section>
        <Title>Lightning Channel Visualizer</Title>
      </Section>

      {#if $connectionStatus}
        <Section>
          <div class="absolute right-0 top-17 text-right p-2 z-50">
            <div style="color: #ededed" class="text-sm inline-block">{$connectionStatus}</div>
            <div
              class:bg-green-500={$connectionStatus === 'connected'}
              class:bg-yellow-500={$connectionStatus === 'connecting' ||
                $connectionStatus === 'waiting_reconnect'}
              class:bg-red-500={$connectionStatus === 'disconnected'}
              class="w-3 h-3 rounded-full ml-1 inline-block transition-colors"
            />
          </div>
        </Section>
      {/if}
    </Row>
  </TopAppBar>

  <div class="content flex-grow overflow-hidden" />

  <!--div class="w-full mt-4 text-sm p-4 border-2 rounded border-purple-300">
    <label class="text-neutral-600 font-medium mb-1 block" for="address">Address</label>
    <textarea
      id="address"
      class="border w-full p-2 rounded"
      rows="3"
      bind:value={address}
      placeholder="033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408@localhost:7272"
    />

    <label class="text-neutral-600 font-medium mb-1 block" for="rune">Rune</label>
    <textarea
      id="rune"
      class="border w-full p-2 rounded"
      rows="2"
      bind:value={rune}
      placeholder="O2osJxV-6lGUgAf-0NllduniYbq1Zkn-45trtbx4qAE9MA=="
    />

    <div class="flex items-center justify-between w-full">
      <button
        on:click={executeConnect}
        disabled={!address}
        class="mt-2 border border-purple-500 rounded py-1 px-4 disabled:opacity-20 hover:shadow-md active:shadow-none"
        >Connect</button
      >

      {#if $connectionStatus}
        <div class="flex items-center">
          <div class="text-sm">{$connectionStatus}</div>
          <div
            class:bg-green-500={$connectionStatus === 'connected'}
            class:bg-yellow-500={$connectionStatus === 'connecting' ||
              $connectionStatus === 'waiting_reconnect'}
            class:bg-red-500={$connectionStatus === 'disconnected'}
            class="w-3 h-3 rounded-full ml-1 transition-colors"
          />
        </div>
      {/if}
    </div>
  </div-->

  <div
    class="footer pl-4 pr-4 pt-0 pb-4 bottom-0 w-screen flex flex-wrap flex-row justify-between items-center"
  >
    <div class="textfield mr-2" style="flex: 2;">
      <Textfield variant="standard" bind:value={address} label="Address">
        <HelperText persistent slot="helper"
          >033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408@localhost:7272</HelperText
        >
      </Textfield>
    </div>

    <div class="textfield mr-2" style="flex: 1">
      <Textfield variant="standard" bind:value={rune} label="Rune">
        <HelperText persistent slot="helper"
          >O2osJxV-6lGUgAf-0NllduniYbq1Zkn-45trtbx4qAE9MA==</HelperText
        >
      </Textfield>
    </div>
    <div
      class=""
      style="display: flex; flex-direction: column; flex: 1; color: rgba(0, 0, 0, 0.6);"
    >
      <div>
        <FormField style="display: flex; flex-direction: row; align-items: baseline;">
          <Checkbox class="mr-2" bind:checked={useTls} touch />
          <span style="height: 28px;" slot="label">Use TLS</span>
        </FormField>
      </div>

      <Button
        class="load-button"
        variant="raised"
        style="margin-top: -10px;"
        on:click={() => executeConnect()}
        disabled={!address || !rune}
      >
        <Label class="font-bold">Draw</Label>
      </Button>
    </div>
  </div>
</main>

<!--div class="w-full flex justify-center mt-auto">
  <div class="p-4 border-2 rounded border-green-300">
    <div id="d3-container" style="width: 800px; height:1800px pb-40">
      <div class="chart" />
    </div>
  </div>
</div-->

<style>
  main {
    font-family: 'Roboto', sans-serif;
  }

  :global(.mdc-top-app-bar__title) {
    color: #ffffff;
  }

  .content {
    background-color: #ffffff;
  }

  :global(.mdc-text-field) {
    width: 48rem;
  }

  .textfield {
    width: 100%;
  }

  @media (min-width: 1024px) {
    .textfield {
      width: 48rem;
    }
  }

  .footer {
    background-color: #ffffff;
    color: #ffffff;
  }

  :global(.mdc-button) {
    color: #ffffff;
    --mdc-theme-on-primary: #ffffff;
  }
</style>
