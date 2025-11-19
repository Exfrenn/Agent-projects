# agent.py

from mesa.discrete_space import CellAgent, FixedAgent

class RandomAgent(CellAgent):
    """
    Agent that moves randomly.
    Attributes:
        unique_id: Agent's ID
    """
    def __init__(self, model, cell, energy=100, energy_unit=1):
        """
        Creates a new random agent.
        Args:
            model: Model reference for the agent
            cell: Reference to its position within the grid
            energy: Starting amount of energy
            energy_from_tile: Energy reduced from 1 unit of floor tile
        """
        super().__init__(model)
        self.energy = energy
        self.energy_from_tile = energy_unit
        self.cell = cell
        
    def discharge(self):
        """If possible, discharge on the current floor tile"""
        self.energy -= self.energy_from_tile


    def clean(self):
        """If possible, clean the current floor tile"""
        floor_tile = next(
            obj for obj in self.cell.agents if isinstance(obj, FloorAgent)
        )
        if not floor_tile.fully_clean:
            self.discharge()
            floor_tile.fully_clean = True

    def charge(self):
        """If possible, charge on the current floor tile"""
        floor_tile = next(
            obj for obj in self.cell.agents if isinstance(obj, StationAgent)
        )
        if not floor_tile.fully_clean:
            self.energy += self.energy_unit

    def move(self):
        """
        Determines the next empty cell in its neighborhood, and moves to it
        """
        # si el num random que se genera es mayor a 0.5:
        if self.random.random() < 0.5:
            self.discharge()
            # Checks which grid cells are empty
            next_moves = self.cell.neighborhood.select(lambda cell: cell.is_empty) # filtra las celdas que esten vacias
            self.cell = next_moves.select_random_cell() # selecciona una celda aleatoria (vacia)

    def step(self):
        """
        Determines the new direction it will take, and then moves
        """
        self.move()

        if self.energy < 0:
            self.remove()


class ObstacleAgent(FixedAgent):
    """
    Obstacle agent. Just to add obstacles to the grid.
    """
    def __init__(self, model, cell):
        super().__init__(model)
        self.cell=cell

    def step(self):
        pass

class StationAgent(FixedAgent):
    """
    Station agent. Energy supplier for a RandomAgent whenever it steps on it.
    """
    def __init__(self, model, cell):
        super().__init__(model)
        self.cell=cell

    def step(self):
        pass


class FloorAgent(FixedAgent):
    """
    Floor agent. Changes state whenever a RandomAgent steps on it.
    """

    @property
    def fully_clean(self):
        """Whether the floor is fully clean."""
        return self._fully_clean

    @fully_clean.setter
    def fully_clean(self, value: bool) -> None:
        self._fully_clean = value


    def __init__(self, model, cell, is_clean=False):
        """
        Create a new floor tile.
        
        Args:
            model: Model instance
            cell: Cell to which this floor tile belongs
            is_dirty: Whether the tile starts dirty (False = clean, True = dirty)
        """
        super().__init__(model)
        self.cell=cell
        self._fully_clean = is_clean

    def step(self):
        if self._fully_clean == True:
            self.remove()