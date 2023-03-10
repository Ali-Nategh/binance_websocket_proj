import { Injectable, OnModuleInit } from "@nestjs/common";
import { KlineCandleRepository } from "src/websocket/kline-candle.repository";
import { Spot } from '@binance/connector' // 2nd Implementation
// import { io, Socket } from "socket.io-client";


@Injectable()
export class BinanceSocketClient
    implements OnModuleInit {

    constructor(private readonly klineCandleRepository: KlineCandleRepository) { }

    onModuleInit() {
        const { Console } = require('console')

        const logger = new Console({ stdout: process.stdout, stderr: process.stderr })
        const client = new Spot('', '', { logger })

        const callbacks = {
            open: () => logger.info('open'),
            close: () => logger.info('closed'),
            message: async (data: any) => {
                data = JSON.parse(data)
                // console.log('\n', data) // FOR TESTS
                await this.klineCandleRepository.create({
                    eventType: data.e,
                    eventTime: data.E,
                    symbol: data.s,
                    kLineInfo: data.k,
                })
            }
        }

        const wsRef = client.klineWS('btcusdt', '1s', callbacks)

        setInterval(() => {
            client.pingServer(wsRef)
        }, 50000)

        // // disconnect after 1 minute
        // setTimeout(() => client.unsubscribe(wsRef), 60000)
    }


    //-----------------------------------------------------------------------------------------
    //--------------------------THIS IMPLEMENTATION DID NOT WORK-------------------------------
    // // Couldn't get any response back from the server or it didn't connect properly

    // public socketClient: Socket;

    // constructor() {
    //     this.socketClient = io('wss://stream.binance.com:9443/ws/btcusdt@kline_1s', { reconnectionDelayMax: 10000 })
    // }

    // onModuleInit() {
    //     this.registerConsumerEvents()
    // }

    // private registerConsumerEvents() {

    //     var ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1s')
    //     // Listen for messages
    //     ws.onmessage = (event) => {
    //         let stockObject = JSON.parse(event.data)
    //         console.log(stockObject)
    //     }


    // console.log(this.socketClient.active)
    // console.log(this.socketClient.connected)
    // this.socketClient.connect()
    // console.log(this.socketClient.connected)

    // this.socketClient.on('error', (error: any) => {
    //     console.log('SERVER:', error)
    // })
    // this.socketClient.on('connect', () => {
    //     console.log('SERVER: Connected')
    // })
    // this.socketClient.on('ping', (payload: any) => {
    //     console.log('SERVER:', payload)
    // })
    // this.socketClient.onAny((event, ...args) => {
    //     console.log(`got ${event}`);
    // });


    // this.socketClient.on('open', () => {
    //     console.log('SERVER: Connected to Gateway')
    // });
    // }

}
