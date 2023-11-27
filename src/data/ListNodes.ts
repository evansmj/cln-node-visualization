interface Node {
  nodeid: string;
  alias: string;
  color: string;
  last_timestamp: number;
  features: string;
  addresses: string[];
  option_will_fund: {
    lease_fee_base_msat: number;
    lease_fee_basis: number;
    funding_weight: number;
    channel_fee_max_base_msat: number;
    channel_fee_max_proportional_thousandths: number;
    compact_lease: string;
  }
}

interface ListNodes {
  nodes: Node[];
}