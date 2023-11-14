interface Peer {
    id: string
    connected: boolean
    num_channels: number
    netaddr: string[]
    features: string
}

interface ListPeers {
    peers: Peer[]
}