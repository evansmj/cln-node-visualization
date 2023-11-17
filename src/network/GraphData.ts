interface Node {
    id: number //node_id
    name: string //node_alias if exists
}

interface Link {
    source: number //node_id
    target: number //node_id
}

interface GraphData {
    nodes: Node[]
    links: Link[]
}
