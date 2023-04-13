<script lang="ts">
  import Lnmessage from 'lnmessage'
  import { parseNodeAddress } from './utils.js'

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
      wsProtocol: 'ws:'
    })

    // initiate the connection to the remote node
    await ln.connect()
  }
</script>

<main class="w-screen h-screen flex items-center justify-center p-6">
  <div class="w-1/2">
    <h1 class="font-bold text-3xl mb-4 text-start w-full">Create CoreLN App</h1>
    <div class="w-full mt-4 text-sm p-4 border rounded border-purple-300">
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

    <div class="w-full mt-8 text-sm p-4 border rounded border-yellow-300">
      <label class="text-neutral-600 font-medium mb-1 block" for="rune">Rune</label>
      <textarea
        id="rune"
        class="border w-full p-2 rounded"
        rows="2"
        bind:value={rune}
        placeholder="O2osJxV-6lGUgAf-0NllduniYbq1Zkn-45trtbx4qAE9MA=="
      />
    </div>

    <div class="p-4 border rounded border-green-300 mt-8">
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
        on:click={connect}
        disabled={!rune || !method}
        class="mt-2 border border-purple-500 rounded py-1 px-4 disabled:opacity-20 hover:shadow-md active:shadow-none"
        >Request</button
      >
    </div>
  </div>

  <div class="w-1/2 p-4 border rounded border-pink-400 ml-4">
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
