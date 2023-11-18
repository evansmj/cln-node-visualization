import type { Writable } from 'svelte/store';
import { nodeService } from '../network/NodeService'
import type { NodeService } from '../network/NodeService';

export class PageViewModel {

  private connectionStatus: Writable<string>
  private nodeService: NodeService
  private graphData: Promise<GraphData>

  constructor(nodeService: NodeService) {
    this.nodeService = nodeService
    this.connectionStatus = nodeService.connectionStatus
  }

  connect(address: string, rune: string) {
    console.log("PageViewModel.connect()")
    this.nodeService.connect(address, rune)
    this.graphData = this.nodeService.getGraphData()
  }

  getGraphData(): Promise<GraphData> {
    return this.graphData
  }

  getConnectionStatus(): Writable<string> {
    return this.connectionStatus
  }

  onDestroy() {
    this.nodeService.disconnect()
  }

}

export const pageViewModel = new PageViewModel(nodeService); 
