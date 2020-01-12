const { Network } = require('./network');

describe('Network', () => {
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

  test('Can run network of 50 computers.', async () => {
    const network = new Network(50);
    await network.runToIdle();
    await network.kill();
    expect(network.natQueue).toHaveLength(1);
    expect(network.natQueue[0]).toEqual([21493, 17849])
  });

  test('Can run two iterations.', async () => {
    const network = new Network(50);
    await network.runToIdle();
    expect(network.natQueue).toHaveLength(1);
    expect(network.natQueue[0]).toEqual([21493, 17849])
    network.workers[0].sendMessage(21493, 17849)
    await network.runToIdle();
    await network.kill();
    expect(network.natQueue).toHaveLength(7);
    expect(network.natQueue[0]).toEqual([21493, 17849])
  })
});