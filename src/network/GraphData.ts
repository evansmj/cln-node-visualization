export {};

export interface Node {
    id: number //index in list
    nodeId: string //nodeId of the node
    name: string //node_alias if exists else node_id
    color: string
}

export interface Link {
    source: number //by index in list
    target: number //by index in list
}

export interface GraphData {
    nodes: Node[]
    links: Link[]
}
