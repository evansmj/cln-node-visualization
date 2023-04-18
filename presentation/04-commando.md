# Commando

[Commando](https://docs.corelightning.org/reference/lightning-commando) is a Core Lightning plugin that sends a custom message to a connected to peer to call a RPC method on their node. Bearer tokens called "runes" are used to provide fine grained control over what methods can be called. Lnmessage sends custom commando messages from the browser to a node to interact with it's RPC methods.

## Runes

A rune can be created by using the [`commando-rune`](https://docs.corelightning.org/reference/lightning-commando-rune) method. The docs explain in depth and have some good examples of what kind of restrictions can be encoded in a rune.

- Runes are bearer tokens, anyone who has access to the rune can make calls on the node that issued it.
- Currently there is no way to revoke a rune. A revoke list could be created in future, but for now be careful when handling mainnet runes.
- Ways to mitigate risks:
  - Always add rate limits to runes: `lightning-cli commando-rune restrictions='[["rate=60"], ...other restrictions here]'`
    - Prevents your node from getting DOS'd
  - Restrict the rune to a specific node id: `lightning-cli commando-rune restrictions='[["id=036a72d5f5938d587ff776e77224c5ca1bdf7645f4f11aa702f8f426a4577179de"], ...other restrictions here]'`
    - Only a specific node can make calls on your node
    - Reduces the risk when passing around the rune (like saving in notes to transfer to a different device)
    - When using Lnmessage, the `privateKey` parameter can be used like a session secret and stored on the device. This will ensure that the browser has a consistent public key when connecting to a node and the rune can be restricted to this public key. Once the `privateKey` is cleared from the device, the session is cleared and the rune becomes essentially revoked.