import Lnmessage from 'lnmessage';
import { parseNodeAddress } from '../routes/utils';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { subscribe } from 'svelte/internal';
import { Subject } from 'rxjs'
import type { Subscription } from 'rxjs'

export class NodeService {
    connectionStatus: Writable<string>;
    rune: string
    ln: Lnmessage;
    subscription: Subscription

    constructor() {
        this.connectionStatus = writable('disconnected');
    }

    disconnect = () => {
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
    }

    connect = async (address: string, runeValue: string) => {
        const { publicKey, ip, port } = parseNodeAddress(address);
        this.rune = runeValue;

        this.ln = new Lnmessage({
            remoteNodePublicKey: publicKey,
            ip,
            port,
            wsProtocol: 'ws:',
            logger: {
                info: console.log,
                error: console.error,
                warn: console.warn
            }
        });
        
        if(this.ln) {
            this.subscription = this.ln.connectionStatus$.subscribe(newStatus => {
                this.connectionStatus.set(newStatus);
            });
        }

        await this.ln.connect();
    }

    getListChannels = async () => {
        return this.request('listchannels', '')
    }

    getListPeers = async () => {
        return this.request('listpeers', '')
    }

    getSql = async (query: string) => {
      return this.request('sql', `{"query":"${query}"}`);
    }

    request = async (method: string, params: string) => {
        let parsedParams: unknown | undefined

        try {
            parsedParams = params ? JSON.parse(params) : undefined

            const requestResult = await this.ln.commando({
                method,
                params: parsedParams,
                rune: this.rune
            })

            let result = JSON.stringify(requestResult, null, 2)
            return result
        } catch (error) {
            const { message } = error as { message: string }
            alert(message)
            return
        }
    }
}

export const nodeService = new NodeService(); 