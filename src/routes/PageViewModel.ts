import type { Writable } from 'svelte/store';
import { nodeService } from '../network/NodeService'
import type { NodeService } from '../network/NodeService';
import { BehaviorSubject, Observable } from 'rxjs'
import type { GraphData } from '../network/GraphData';

export class PageViewModel {

  private connectionStatus: Writable<string>
  private nodeService: NodeService
  private graphDataBehaviorSubject = new BehaviorSubject<GraphData | null>(null)

  constructor(nodeService: NodeService) {
    this.nodeService = nodeService
    this.connectionStatus = nodeService.connectionStatus
  }

  connect(address: string, rune: string) {
    console.log("PageViewModel.connect()")
    this.nodeService.connect(address, rune)
    this.nodeService.getGraphData().then(d => {
      console.log("viewmodel getGraphData d = " + d.nodes.length)
      this.graphDataBehaviorSubject.next(d)
    })
  }

  getGraphData(): Observable<GraphData | null> {
    return this.graphDataBehaviorSubject.asObservable()
  }

  getConnectionStatus(): Writable<string> {
    return this.connectionStatus
  }

  onDestroy() {
    this.nodeService.disconnect()
  }

}

export const pageViewModel = new PageViewModel(nodeService); 
