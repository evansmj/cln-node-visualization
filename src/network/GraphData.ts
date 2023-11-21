export {};

export interface Node {
    id: number //node_id
    name: string //node_alias if exists
}

export interface Link {
    source: number //node_id
    target: number //node_id
}

export interface GraphData {
    nodes: Node[]
    links: Link[]
}
