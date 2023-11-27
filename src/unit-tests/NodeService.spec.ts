import { afterEach, beforeEach, test } from 'vitest'
import { get } from 'svelte/store';
import { NodeService } from '../network/NodeService'
import { expect } from 'vitest'
import LnMessage from 'lnmessage';

var sinon = require("sinon")

let mockConnect: sinon.SinonStub;
let mockCommando: sinon.SinonStub;

beforeEach(() => {
  mockConnect = sinon.stub(LnMessage.prototype, 'connect')
  mockCommando = sinon.stub(LnMessage.prototype, 'commando')
});

afterEach(() => {
  // restore the methods after each test
  mockConnect.restore();
  mockCommando.restore();
});

test('NodeService runs connect function', async () => {
  const nodeService = new NodeService()
  await nodeService.connect('03d292c7b22338ebbb92d1c4d81720e08e8dc7e91c3ce7aaf9f210e61f6788ba50@localhost:1337', 'bAgZXtcazR87N4cbUAmOeO0gtNMuYcR4RGZ-nimelC49MA==')
  expect(mockConnect.calledOnce).toBe(true)
  mockConnect.restore
})

test('NodeService initializes with correct initial state', () => {
  const nodeService = new NodeService();

  expect(get(nodeService.connectionStatus)).toBe('disconnected');
})

test('NodeService parses ListChannels properly', async () => {
  const nodeService = new NodeService()
  await nodeService.connect('03d292c7b22338ebbb92d1c4d81720e08e8dc7e91c3ce7aaf9f210e61f6788ba50@localhost:1337', 'bAgZXtcazR87N4cbUAmOeO0gtNMuYcR4RGZ-nimelC49MA==')

  mockCommando.withArgs(sinon.match.has('method', 'listchannels')).returns(Promise.resolve(
    {
      channels: [
        {
          source: 'a',
          destination: 'b',
          short_channel_id: "123",
          direction: 1,
          public: true,
          amount_msat: 123,
          message_flags: 4355,
          channel_flags: 43241,
          active: true,
          last_update: 54324324,
          base_fee_millisatoshi: 9494,
          fee_per_millionth: 124124,
          delay: 4214,
          htlc_minimum_msat: 444444,
          htlc_maximum_msat: 2334141241,
          features: 'feature'
        }
      ]
    })
  )

  let listChannels = await nodeService.getListChannels()

  expect(listChannels.channels[0].source).toBe('a')
  expect(listChannels.channels[0].destination).toBe('b');
  expect(listChannels.channels[0].short_channel_id).toBe('123');
  expect(listChannels.channels[0].direction).toBe(1);
  expect(listChannels.channels[0].public).toBe(true);
  expect(listChannels.channels[0].amount_msat).toBe(123);
  expect(listChannels.channels[0].message_flags).toBe(4355);
  expect(listChannels.channels[0].channel_flags).toBe(43241);
  expect(listChannels.channels[0].active).toBe(true);
  expect(listChannels.channels[0].last_update).toBe(54324324);
  expect(listChannels.channels[0].base_fee_millisatoshi).toBe(9494);
  expect(listChannels.channels[0].fee_per_millionth).toBe(124124);
  expect(listChannels.channels[0].delay).toBe(4214);
  expect(listChannels.channels[0].htlc_minimum_msat).toBe(444444);
  expect(listChannels.channels[0].htlc_maximum_msat).toBe(2334141241);
  expect(listChannels.channels[0].features).toBe('feature');
})

test('NodeService parses ListNodes properly', async () => {
  const nodeService = new NodeService()
  await nodeService.connect('03d292c7b22338ebbb92d1c4d81720e08e8dc7e91c3ce7aaf9f210e61f6788ba50@localhost:1337', 'bAgZXtcazR87N4cbUAmOeO0gtNMuYcR4RGZ-nimelC49MA==')

  mockCommando.withArgs(sinon.match.has('method', 'listnodes')).returns(Promise.resolve(
    {
      nodes: [
        {
          nodeid: 'id',
          alias: 'alias',
          color: 'orange',
          last_timestamp: 1337,
          features: 'features',
          addresses: ["a, b, c"],
          option_will_fund: {
            lease_fee_base_msat: 1,
            lease_fee_basis: 2,
            funding_weight: 3,
            channel_fee_max_base_msat: 4,
            channel_fee_max_proportional_thousandths: 5,
            compact_lease: "compact_lease"
          }
        }
      ]
    })
  )

  let listPeers = await nodeService.getListNodes()

  expect(listPeers.nodes[0].nodeid).toBe('id');
  expect(listPeers.nodes[0].alias).toBe('alias');
  expect(listPeers.nodes[0].color).toBe('orange');
  expect(listPeers.nodes[0].last_timestamp).toBe(1337);
  expect(listPeers.nodes[0].features).toBe('features');
  expect(listPeers.nodes[0].addresses).toEqual(["a, b, c"]);
  expect(listPeers.nodes[0].option_will_fund.lease_fee_base_msat).toBe(1);
  expect(listPeers.nodes[0].option_will_fund.lease_fee_basis).toBe(2);
  expect(listPeers.nodes[0].option_will_fund.funding_weight).toBe(3);
  expect(listPeers.nodes[0].option_will_fund.channel_fee_max_base_msat).toBe(4);
  expect(listPeers.nodes[0].option_will_fund.channel_fee_max_proportional_thousandths).toBe(5);
  expect(listPeers.nodes[0].option_will_fund.compact_lease).toBe("compact_lease");
})
