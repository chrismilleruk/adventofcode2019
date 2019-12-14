const { paintingRobot } = require('./paintingRobot');


describe('Painting Robot', () => {
  /* 
  You'll need to build a new emergency hull painting robot. The robot needs to be able 
  to move around on the grid of square panels on the side of your ship, detect the color 
  of its current panel, and paint its current panel black or white. (All of the panels are 
  currently black.)
  
  The Intcode program will serve as the brain of the robot. The program uses input instructions
  to access the robot's camera: provide 0 if the robot is over a black panel or 1 if the robot 
  is over a white panel. Then, the program will output two values:
  
  First, it will output a value indicating the color to paint the panel the robot is over: 
    0 means to paint the panel black, and 1 means to paint the panel white.
  Second, it will output a value indicating the direction the robot should turn: 
    0 means it should turn left 90 degrees, and 1 means it should turn right 90 degrees.
  After the robot turns, it should always move forward exactly one panel. The robot starts facing up.
  
  */

  describe('Example', () => {
    const exampleProgram = [
      1105, 10, 10, 10, 10, 10, 10, 10, 10, 10, 
      // For example, suppose the robot is about to start running. 
      // Drawing black panels as ., white panels as #, 
      // and the robot pointing the direction it is facing (< ^ > v), 
      // the initial state and region near the robot looks like this:
      // .....
      // .....
      // ..^..
      // .....
      // .....
      // The panel under the robot (not visible here because a ^ is shown instead) is also black, 
      // and so any input instructions at this point should be provided 0. 

      3, 1, 104, 1, 104, 0,
      // Suppose the robot eventually outputs 1 (paint white) and then 0 (turn left).
      // After taking these actions and moving forward one panel, the region now looks like this:
      // .....
      // .....
      // .<#..
      // .....
      // .....

      3, 2, 104, 0, 104, 0, 
      // Input instructions should still be provided 0. 
      // Next, the robot might output 0 (paint black) and then 0 (turn left):
      // .....
      // .....
      // ..#..
      // .v...
      // .....

      3, 3, 104, 1, 104, 0, 
      3, 4, 104, 1, 104, 0, 
      // After more outputs (1,0, 1,0):
      // .....
      // .....
      // ..^..
      // .##..
      // .....

      // The robot is now back where it started, but because it is now on a white panel, 
      // input instructions should be provided 1. 
      3, 5, 
      
              104, 0, 104, 1, 
      3, 6, 104, 1, 104, 0, 
      3, 7, 104, 1, 104, 0, 
      // After several more outputs (0,1, 1,0, 1,0), the area looks like this:
      // .....
      // ..<#.
      // ...#.
      // .##..
      // .....
      99
    ];

    // Before you deploy the robot, you should probably have an estimate of the area it will cover: 
    // specifically, you need to know the number of panels it paints at least once, regardless of color. 
    // In the example above, the robot painted 6 panels at least once. 
    // (It painted its starting panel twice, but that panel is still only counted once; 
    //   it also never painted the panel it ended on.)
    test('example paints 6 panels', async () => {
      let program = exampleProgram.slice();
      let panels = await paintingRobot(program);

      // check inputs.
      expect(program.slice(1, 8)).toEqual([0, 0, 0, 0, 1, 0, 0]);
      
      // check outputs
      let paintedPanels = [...panels.values()].filter(panel => panel.coats > 0);
      expect(paintedPanels.length).toBe(6);
    })
  })
});
