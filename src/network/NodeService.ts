import Lnmessage from 'lnmessage';
import { parseNodeAddress } from '../routes/utils';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { subscribe } from 'svelte/internal';
import { Subject } from 'rxjs'
import type { Subscription } from 'rxjs'

export class NodeService {
  connectionStatus: Writable<string>;
  rune: string
  ln: Lnmessage;
  subscription: Subscription

  constructor() {
    this.connectionStatus = writable('disconnected');
  }

  disconnect = () => {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  connect = async (address: string, runeValue: string) => {
    const { publicKey, ip, port } = parseNodeAddress(address);
    this.rune = runeValue;

    this.ln = new Lnmessage({
      remoteNodePublicKey: publicKey,
      ip,
      port,
      wsProtocol: 'ws:',
      logger: {
        info: console.log,
        error: console.error,
        warn: console.warn
      }
    });

    if (this.ln) {
      this.subscription = this.ln.connectionStatus$.subscribe(newStatus => {
        this.connectionStatus.set(newStatus);
      });
    }

    await this.ln.connect();
  }

  getListChannels = async (): Promise<ListChannels> => {
    const data = await this.request('listchannels', '') as ListChannels
    return data
  }

  getListPeers = async (): Promise<ListPeers> => {
    const data = await this.request('listpeers', '') as ListPeers
    return data
  }

  getGraphData = async (): Promise<GraphData> => {
    console.log("NodeService.getGraphData() start")
    let channelsData = await this.getListChannels()
    console.log("channelsData = " + channelsData.channels.length)
    let peersData = await this.getListPeers()
    console.log("peers data = " + peersData.peers.length)

    // create nodes from peers
    const nodes: Node[] = peersData.peers.map((peer, index) => ({
      id: index,
      name: peer.id // Assign peer.id as node name. Use peer.node_alias if exists
    }))

    const links: Link[] = channelsData.channels.map(channel => {
      //find node.id using node.name...
      console.log("channel source = " + channel.source)
      console.log("channel destination = " + channel.destination)
      nodes.every(node => console.log("node.name = " + node.name))
      const sourceNodeId = nodes.find(node => node.name === channel.source)?.id
      const targetNodeId = nodes.find(node => node.name === channel.destination)?.id

      if (sourceNodeId === undefined || targetNodeId === undefined) {
        return null;
      }

      return {
        source: sourceNodeId,
        target: targetNodeId,
      };
    }).filter(link => link !== null) as Link[]

    return { nodes, links }
  }

  getSql = async (query: string) => {
    return this.request('sql', `{"query":"${query}"}`)
  }

  request = async (method: string, params: string) => {
    let parsedParams: unknown | undefined

    try {
      parsedParams = params ? JSON.parse(params) : undefined

      const requestResult = await this.ln.commando({
        method,
        params: parsedParams,
        rune: this.rune
      })

      return requestResult
    } catch (error) {
      const { message } = error as { message: string }
      alert(message)
      return
    }
  }
}

export const nodeService = new NodeService(); 