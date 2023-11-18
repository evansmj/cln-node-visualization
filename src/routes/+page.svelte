<script lang="ts">
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import { pageViewModel } from './PageViewModel'

  let address: string
  let rune: string
  let svg: any

  let connectionStatus = pageViewModel.getConnectionStatus()
  let graphData: GraphData
  //let graphDataPromise = pageViewModel.getGraphData()

  $: if (graphData !== undefined) {
    updateGraph(graphData)
  }

  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

  onMount(async () => {
    console.log('onMount() pageViewModel ' + pageViewModel)

    // append the svg object to the body of the page
    svg = d3
      .selectAll('div.chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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
    //d3.selectAll('.chart').append('p').text('Hello World')

    //viewmodel graphData is ready here.
  })

  function updateGraph(data: GraphData) {
    console.log('updateGraph ' + data.nodes.length)
    var link = svg.selectAll('line').data(data.links).enter().append('line').style('stroke', '#aaa')

    var node = svg
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 20)
      .style('fill', '#69b3a2')

    var simulation = d3
      .forceSimulation(data.nodes)
      .force(
        'link',
        d3
          .forceLink()
          .id(function (d) {
            return d.name
          })
          .links(data.links)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('end', ticked)

    function ticked() {
      link
        .attr('x1', function (d) {
          return d.source.x
        })
        .attr('y1', function (d) {
          return d.source.y
        })
        .attr('x2', function (d) {
          return d.target.x
        })
        .attr('y2', function (d) {
          return d.target.y
        })
      node
        .attr('cx', function (d) {
          return d.x + 6
        })
        .attr('cy', function (d) {
          return d.y - 6
        })
    }
  }

  function executeConnect() {
    pageViewModel.connect(address, rune)
  }
</script>

<main class="w-screen flex items-center justify-center p-6 relative">
  <!--{#if ln}
    <div class="absolute top-1 right-1 px-2 py-1 border-green-600 rounded border text-sm">
      Browser Id: {`${ln.publicKey.slice(0, 8)}...${ln.publicKey.slice(-8)}`}
    </div>
  {/if}-->

  <div class="w-1/2 max-w-lg">
    <h1 class="font-bold text-3xl mb-4 w-full text-center">CLN Node Visualizer</h1>
    <div class="w-full mt-4 text-sm p-4 border-2 rounded border-purple-300">
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
    </div>
  </div>
</main>

<div class="w-full flex justify-center mt-auto">
  <div class="p-4 border-2 rounded border-green-300">
    <div id="d3-container" style="width: 800px; height:800px">
      <div class="pb-40">
        <div class="chart" />
      </div>
    </div>
  </div>
</div>
