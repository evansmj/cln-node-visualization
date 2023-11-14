interface Node {
    id: number
    name: string
}

interface Link {
    source: number
    target: number
}

interface GraphData {Í
    nodes: Node[]
    links: Link[]
}
