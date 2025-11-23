from mesa.discrete_space import CellAgent, FixedAgent

class RandomAgent(CellAgent):
    def __init__(self, model, cell, unique_id):
        super().__init__(model)
        self.cell = cell
        self.unique_id = unique_id
        self.steps_taken = 0

    def move(self):
        if self.random.random() < 0.5:
            next_moves = self.cell.neighborhood.select(
                lambda cell: cell.is_empty)
            self.cell = next_moves.select_random_cell()
            self.steps_taken+=1

            if self.cell not in self.model.cleaned_cells:
                self.model.cleaned_cells.add(self.cell)
                self.model.clean_tiles += 1

    def step(self):
        self.move()


class ObstacleAgent(FixedAgent):
    def __init__(self, model, cell, unique_id):
        super().__init__(model)
        self.cell=cell
        self.unique_id = unique_id

    def step(self):
        pass
