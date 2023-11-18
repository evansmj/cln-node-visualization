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

test('NodeService parses ListPeers properly', async () => {
  const nodeService = new NodeService()
  await nodeService.connect('03d292c7b22338ebbb92d1c4d81720e08e8dc7e91c3ce7aaf9f210e61f6788ba50@localhost:1337', 'bAgZXtcazR87N4cbUAmOeO0gtNMuYcR4RGZ-nimelC49MA==')

  mockCommando.withArgs(sinon.match.has('method', 'listpeers')).returns(Promise.resolve(
    {
      peers: [
        {
          id: 'id',
          connected: true,
          num_channels: 123,
          netaddr: ['addr'],
          features: 'features'
        }
      ]
    })
  )

  let listPeers = await nodeService.getListPeers()

  expect(listPeers.peers[0].id).toBe('id');
  expect(listPeers.peers[0].connected).toBe(true);
  expect(listPeers.peers[0].num_channels).toBe(123);
  expect(listPeers.peers[0].netaddr).toEqual(['addr']);
  expect(listPeers.peers[0].features).toBe('features');
})

test('NodeService getData combines listchannels and listpeers properly', async () => {
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
    }))

  mockCommando.withArgs(sinon.match.has('method', 'listpeers')).returns(Promise.resolve(
    {
      peers: [
        {
          id: 'a',
          connected: true,
          num_channels: 123,
          netaddr: ['addr'],
          features: 'features'
        },
        {
          id: 'b',
          connected: true,
          num_channels: 123,
          netaddr: ['addr'],
          features: 'features'
        }
      ]
    }))

  let graphData = await nodeService.getGraphData()

  expect(graphData.nodes).toHaveLength(2);

  expect(graphData.nodes[0].id).toBe(0);
  expect(graphData.nodes[0].name).toBe('a');

  expect(graphData.nodes[1].id).toBe(1);
  expect(graphData.nodes[1].name).toBe('b');

  expect(graphData.links).toHaveLength(1);
  expect(graphData.links[0].source).toBe(0);
  expect(graphData.links[0].target).toBe(1);

})
