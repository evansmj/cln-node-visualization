export type ParsedNodeAddress = {
  publicKey: string
  ip: string
  port?: number
}

export function parseNodeAddress(address: string): ParsedNodeAddress {
  const [publicKey, host] = address.split('@')
  const [ip, port] = host.split(':')

  console.log("publicKey = " + publicKey)
  console.log("ip = " + ip)
  console.log("port = " + port)

  return { publicKey, ip, port: port ? parseInt(port) : undefined }
}
