<script lang="ts">
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import { pageViewModel } from './PageViewModel'
  import type { GraphData, Node } from '../network/GraphData'
  import { Label } from '@smui/banner'
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'
  import Button from '@smui/button'
  import Checkbox from '@smui/checkbox'
  import FormField from '@smui/form-field'
  import { slide } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

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

  let isFooterVisible: boolean = true
  let timeoutId: any // Timeout object

  let isDrawClicked: boolean = false

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
      .stop()
    //.on('tick', ticked)

    simulation.tick(300)

    node.attr('cx', function (d) {
      return d.x
    })
    node.attr('cy', function (d) {
      return d.y
    })
    link.attr('d', pathD)
    node.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })
    node.selectAll('text').call(wrap, 150)

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

  function handleMouseEnter() {
    clearTimeout(timeoutId)
    isFooterVisible = true
  }

  function handleMouseLeave() {
    if (isDrawClicked) {
      timeoutId = setTimeout(() => {
        isFooterVisible = false
      }, 5000)
    }
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
            <a href="https://github.com/evansmj/cln-node-visualization" target="_blank">
              <img src="public/assets/github-mark.svg" alt="Github logo" class="inline-block mr-2" style="height: 2rem;"/>
            </a>            
          <div style="color: #ededed" class="connection-status-text text-sm inline-block">{$connectionStatus}</div>
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

  <div
    class="footer pl-4 pr-4 pt-0 pb-4 bottom-0 w-screen flex flex-wrap flex-row justify-between"
    role="form"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    {#if isFooterVisible}
      <div
        class="textfield mr-2"
        style="flex: 1;"
        transition:slide={{ duration: 500, easing: quintOut, axis: 'y' }}
      >
        <Textfield variant="standard" bind:value={address} label="Address">
          <HelperText persistent slot="helper"
            >033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408@localhost:7272</HelperText
          >
        </Textfield>
      </div>

      <div
        class="textfield mr-2"
        style="flex: 1;"
        transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
      >
        <Textfield variant="standard" bind:value={rune} label="Rune">
          <HelperText persistent slot="helper"
            >O2osJxV-6lGUgAf-0NllduniYbq1Zkn-45trtbx4qAE9MA==</HelperText
          >
        </Textfield>
      </div>

      <div
        style="display: flex; flex-direction: column; flex: 1; color: rgba(0, 0, 0, 0.6);"
        transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
      >
        <div transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}>
          <FormField class="checkboxFormField">
            <Checkbox class="mr-2" bind:checked={useTls} touch />
            <span class="usetlstext" slot="label">Use TLS</span>
          </FormField>
        </div>

        <Button
          class="load-button"
          variant="raised"
          on:click={() => {
            isDrawClicked = true
            executeConnect()
          }}
          disabled={!address || !rune}
        >
          <Label class="font-bold">Draw</Label>
        </Button>
      </div>
    {/if}
  </div>
</main>

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

  @media screen and (max-width: 48rem) {
    :global(.mdc-text-field) {
      width: 100%;
    } 
    .footer {
      flex-direction: column;
    }
  }

  @media screen and (max-width: 28rem) {
    .connection-status-text {
      visibility: hidden;
    }
  }

  :global(.mdc-text-field-helper-line) {
    white-space: normal;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .footer {
    background-color: #ffffff;
    color: #ffffff;
  }

  :global(.mdc-button) {
    color: #ffffff;
    --mdc-theme-on-primary: #ffffff;
  }

  :global(.checkboxFormField) {
    display: flex;
    align-items: baseline;
  }
</style>
