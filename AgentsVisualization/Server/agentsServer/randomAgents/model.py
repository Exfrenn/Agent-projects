from random import shuffle
from mesa import Model
from mesa.discrete_space import OrthogonalMooreGrid
from mesa.datacollection import DataCollector
from .agent import RandomAgent, ObstacleAgent

class RandomModel(Model):
    def __init__(self, num_agents=10, width=8, height=8, seed=42):

        super().__init__(seed=seed)
        self.num_agents = num_agents
        self.seed = seed
        self.width = width
        self.height = height
        self.grid = OrthogonalMooreGrid([width, height], torus=False)
        self.clean_tiles = 0
        self.cleaned_cells = set()

        self.datacollector = DataCollector(
            model_reporters={"Cleaned Tiles": lambda m: m.clean_tiles}
        )

        border = [(x,y) for y in range(height)
                    for x in range(width)
                    if y in [0, height-1] or x in [0, width - 1]]

        for i, cell in enumerate(self.grid):
            if cell.coordinate in border:
                ObstacleAgent(self, cell=cell, unique_id=f"{5000+i}")

        empty_cells = self.grid.empties.cells
        shuffle(empty_cells)

        for i in range(self.num_agents):
            RandomAgent(self, cell=empty_cells[i], unique_id=f"{1000+i}")


        self.running = True

    def step(self):
        self.datacollector.collect(self)
        self.agents.shuffle_do("step")
