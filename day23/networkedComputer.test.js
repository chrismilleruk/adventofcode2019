const { NetworkedComputer, NetworkedComputerWorker } = require('./networkedComputer');
const filename = __dirname + '/input.txt';

const { Worker, isMainThread, workerData } = require('worker_threads');
const workerFilename = __dirname + '/ncWorker.js';

describe('Networked Computer', () => {
  const workers = [];
  
  afterAll(async () => {
    const terminatingWorkers = workers.map((worker) => {
      if (worker && worker.terminate) {
        return worker.terminate();
      }
    });
    await Promise.all(terminatingWorkers);
    workers = [];
  });
  
  test('worker 0', async () => {
    const onMessageSend = jest.fn((...args) => console.log(args));
    const worker = new NetworkedComputerWorker(0, onMessageSend);
    workers.push(worker);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onMessageSend).toHaveBeenCalled();
    expect(onMessageSend).toHaveBeenCalledTimes(6);
    expect(onMessageSend).toHaveBeenCalledWith([13, 1987, 19669]);
    expect(onMessageSend).toHaveBeenCalledWith([43, 81097, 19669]);
    expect(onMessageSend).toHaveBeenCalledWith([43, 162194, 19669]);
    expect(onMessageSend).toHaveBeenNthCalledWith(4, [36, 24671, 19669]);
    expect(onMessageSend).toHaveBeenNthCalledWith(5, [36, 49342, 19669]);
    expect(onMessageSend).toHaveBeenNthCalledWith(6, [36, 74013, 19669]);
  });

  test('worker 1', async () => {
    const onMessageSend = jest.fn((...args) => console.log(args));
    const worker = new NetworkedComputerWorker(1, onMessageSend);
    workers.push(worker);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onMessageSend).not.toHaveBeenCalled();

    worker.sendMessage(178726, -15);
    worker.sendMessage(89363, 2447);
    worker.sendMessage(268089, 1);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onMessageSend).toHaveBeenCalled();
    expect(onMessageSend).toHaveBeenCalledWith([43, 243291, -36705]);
  });

})