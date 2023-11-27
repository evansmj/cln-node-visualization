import Lnmessage from 'lnmessage';
import { parseNodeAddress } from '../routes/utils';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { subscribe } from 'svelte/internal';
import { Subject } from 'rxjs'
import type { Subscription } from 'rxjs'
import type { Node, Link, GraphData } from './GraphData'

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
    return await this.request('listchannels', '') as ListChannels
  }

  getListNodes = async (): Promise<ListNodes> => {
    return await this.request('listnodes', '') as ListNodes
  }

  getGraphData = async (): Promise<GraphData> => {
    console.log("NodeService.getGraphData() start")
    let channelsData = await this.getListChannels()
    let listNodesData = await this.getListNodes()

    // create nodes from all sources and destinations from listchannels...

    const nodeIdSet = new Set<string>()

    channelsData.channels.forEach((channel) => {
      nodeIdSet.add(channel.source)
      nodeIdSet.add(channel.destination)
    })

    //now add all to indexed nodes

    const nodes: Node[] = Array.from(nodeIdSet).map((nodeIdFromSet, index) => {
      const node = listNodesData.nodes.find(({ nodeid }) => nodeid === nodeIdFromSet)

      return {
      id: index,
      nodeId: nodeIdFromSet,
      name: node ? node.alias : nodeIdFromSet,
      color: node ? node.color : "#F7931A"
      }
    })

    const links: Link[] = channelsData.channels.map(channel => {      
      const sourceNodeId = nodes.find(node => node.nodeId === channel.source)?.id
      const targetNodeId = nodes.find(node => node.nodeId === channel.destination)?.id

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