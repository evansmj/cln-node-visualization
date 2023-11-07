<script lang="ts">
  import Lnmessage from 'lnmessage'
  import { parseNodeAddress } from './utils.js'
  import { onMount } from 'svelte';
  import Graph from "graphology";

  let ln: Lnmessage
  let connectionStatus$: Lnmessage['connectionStatus$']

  $: if (ln) {
    connectionStatus$ = ln.connectionStatus$
  }

  let address: string
  let rune: string
  let method: string
  let params: string
  let result: string

  let graphData: string

  let Sigma: any; //todo, they're adding types in the next release of Sigma.js.

  interface Channel {
  source: string;
  destination: string;
  short_channel_id: string;
  direction: number;
  public: boolean;
  amount_msat: number;
  message_flags: number;
  channel_flags: number;
  active: boolean;
  last_update: number;
  base_fee_millisatoshi: number;
  fee_per_millionth: number;
  delay: number;
  htlc_minimum_msat: number;
  htlc_maximum_msat: number;
  features: string;
}

interface ChannelCollection {
  channels: Channel[];
}

  onMount(async () => {
    const module = await import('sigma');
    Sigma = module.default;

    //create my graph here and render in <div id="sigma-container">

      // const container = document.getElementById("sigma-container") as HTMLElement;
      // const graph = new Graph();

      // graph.addNode(graphData, { x: 0, y: 30, size: 5, label: "John", color: "blue" });
      // graph.addNode("Mary", { x: 10, y: 0, size: 3, label: "Mary", color: "red" });
      // graph.addEdge("John", "Mary");

      // const renderer = new Sigma(graph, container);
  });

  async function connect() {
    const { publicKey, ip, port } = parseNodeAddress(address)

    // https://github.com/aaronbarnardsound/lnmessage#initialisation
    ln = new Lnmessage({
      // The public key of the node you would like to connect to
      remoteNodePublicKey: publicKey,
      // WebSocket proxy endpoint to connect through if running in prod
      // wsProxy: 'wss://<WEBSOCKET_PROXY>',
      // The IP address of the node
      ip,
      // The port of the node, defaults to 9735
      port,
      // connect directly to a node without TLS
      wsProtocol: 'ws:',
      logger: {
        info: console.log,
        error: console.error,
        warn: console.warn
      }
    })

    // initiate the connection to the remote node
    await ln.connect()
  }

  async function request() {
    let parsedParams: unknown | undefined

    try {
      parsedParams = params ? JSON.parse(params) : undefined

      const requestResult = await ln.commando({
        method,
        params: parsedParams,
        rune
      })

      result = JSON.stringify(requestResult, null, 2)
      graphData = "yo i loaded stuff"

      const container = document.getElementById("sigma-container") as HTMLElement;
      const graph = new Graph({multi: true});

      let channelCollection: ChannelCollection = JSON.parse(result);
      let source = channelCollection.channels[0].source;
      let destination = channelCollection.channels[0].destination;
      //alert(`source = ${source} destination = ${destination}`);

      // Initialize an empty set
      let nodes = new Set<string>();

      // Add source and destination to the set
      for (let channel of channelCollection.channels) {
        nodes.add(channel.source);
        nodes.add(channel.destination);
      }

      //loop through the set, and add nodes to the graph.  have a counter and add 5 to the x position.
      let nodeArray = Array.from(nodes);
      for (let i = 0; i < nodeArray.length; i++) {
        let n = nodeArray[i];
        let nodeName = n.substring(0, 7);
        let xFactor = (i+1);
        graph.addNode(nodeName, { x: xFactor, y: 5, size: 15, label: nodeName, color: "blue" });
      }

      //loop through the channels list, and make an arrow edge for each
      let channelsArray = channelCollection.channels;
      for (let i = 0; i < channelsArray.length; i++) {
        let source = channelsArray[i].source.substring(0, 7);
        let destination = channelsArray[i].destination.substring(0, 7);
        graph.addEdge(source, destination, {
          type: 'arrow',
          label: '',
          color: '#ff0000'
        });
      }

      const renderer = new Sigma(graph, container, {
        labelThreshold: 0,
        minArrowSize: 50
      });

    } catch (error) {
      const { message } = error as { message: string }
      alert(message)
      return
    }
  }
</script>

<main class="w-screen flex items-center justify-center p-6 relative">
  {#if ln}
    <div class="absolute top-1 right-1 px-2 py-1 border-green-600 rounded border text-sm">
      Browser Id: {`${ln.publicKey.slice(0, 8)}...${ln.publicKey.slice(-8)}`}
    </div>
  {/if}

  <div class="w-1/2 max-w-lg">
    <h1 class="font-bold text-3xl mb-4 w-full text-center">Create CoreLN App</h1>
    <div class="w-full mt-4 text-sm p-4 border-2 rounded border-purple-300">
      <label class="text-neutral-600 font-medium mb-1 block" for="address">Address</label>
      <textarea
        id="address"
        class="border w-full p-2 rounded"
        rows="3"
        bind:value={address}
        placeholder="033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408@localhost:7272"
      />

      <div class="flex items-center justify-between w-full">
        <button
          on:click={connect}
          disabled={!address}
          class="mt-2 border border-purple-500 rounded py-1 px-4 disabled:opacity-20 hover:shadow-md active:shadow-none"
          >Connect</button
        >

        {#if connectionStatus$}
          <div class="flex items-center">
            <div class="text-sm">{$connectionStatus$}</div>
            <div
              class:bg-green-500={$connectionStatus$ === 'connected'}
              class:bg-yellow-500={$connectionStatus$ === 'connecting' ||
                $connectionStatus$ === 'waiting_reconnect'}
              class:bg-red-500={$connectionStatus$ === 'disconnected'}
              class="w-3 h-3 rounded-full ml-1 transition-colors"
            />
          </div>
        {/if}
      </div>
    </div>

    <div class="w-full mt-8 text-sm p-4 border-2 rounded border-yellow-300">
      <label class="text-neutral-600 font-medium mb-1 block" for="rune">Rune</label>
      <textarea
        id="rune"
        class="border w-full p-2 rounded"
        rows="2"
        bind:value={rune}
        placeholder="O2osJxV-6lGUgAf-0NllduniYbq1Zkn-45trtbx4qAE9MA=="
      />
    </div>

    <div class="p-4 border-2 rounded border-orange-300 mt-8">
      <div class="w-full text-sm">
        <label class="text-neutral-600 font-medium mb-1 block" for="method">Method</label>
        <input
          id="method"
          class="border w-full p-2 rounded"
          type="text"
          bind:value={method}
          placeholder="getinfo"
        />
      </div>

      <div class="w-full mt-4 text-sm">
        <label class="text-neutral-600 font-medium mb-1 block" for="params">Params</label>
        <textarea
          id="params"
          class="border w-full p-2 rounded"
          rows="4"
          bind:value={params}
          placeholder={JSON.stringify({ key: 'value' }, null, 2)}
        />
      </div>

      <button
        on:click={request}
        disabled={!connectionStatus$ || !rune || !method}
        class="mt-2 border border-purple-500 rounded py-1 px-4 disabled:opacity-20 hover:shadow-md active:shadow-none"
        >Request</button
      >
    </div>
  </div>

  <div class="w-1/2 max-w-xl p-4 border-2 rounded border-green-300 ml-4">
    <div class="w-full text-sm">
      <label class="text-neutral-600 font-medium mb-1 block" for="params">Result</label>
      <textarea
        id="params"
        class="border w-full p-2 rounded"
        rows="20"
        value={result || ''}
        placeholder={JSON.stringify({ key: 'value' }, null, 2)}
      />
    </div>
  </div>
</main>

<div class="w-full flex justify-center mt-auto">
  <div class="p-4 border-2 rounded border-green-300">
    <div id="sigma-container" style="width: 800px; height:800px">
      <p>Hello world look at this graph</p>
      <img src="https://i.imgur.com/oecHiLK.jpeg" alt="Look at this graph" height="200" width="200"/>
    </div>
  </div>
</div>
