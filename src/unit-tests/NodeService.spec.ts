import { test } from 'vitest'
import { get } from 'svelte/store';
import { NodeService } from '../network/NodeService'
import { expect } from 'vitest'
import LnMessage from 'lnmessage';

var sinon = require("sinon")

test('NodeService runs connect function', async () => {
  const nodeService = new NodeService()
  const mockLnmessageConnect = sinon.stub(LnMessage.prototype, "connect")
  await nodeService.connect('03d292c7b22338ebbb92d1c4d81720e08e8dc7e91c3ce7aaf9f210e61f6788ba50@localhost:1337', 'bAgZXtcazR87N4cbUAmOeO0gtNMuYcR4RGZ-nimelC49MA==')
  expect(mockLnmessageConnect.calledOnce).toBe(true)
  mockLnmessageConnect.restore
})


test('NodeService initializes with correct initial state', () => {
  const nodeService = new NodeService();

  expect(get(nodeService.connectionStatus)).toBe('disconnected');
})