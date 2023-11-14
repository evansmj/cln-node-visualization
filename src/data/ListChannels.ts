interface ListChannels {
    channels: Channel[]
}

interface Channel {
    source: string
    destination: string
    short_channel_id: string
    direction: number
    public: boolean
    amount_msat: number
    message_flags: number
    channel_flags: number
    active: boolean
    last_update: number
    base_fee_millisatoshi: number
    fee_per_millionth: number
    delay: number
    htlc_minimum_msat: number
    htlc_maximum_msat: number
    features: string
}
