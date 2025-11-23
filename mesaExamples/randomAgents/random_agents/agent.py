from mesa.discrete_space import CellAgent, FixedAgent

STATE_CHARGING = "CHARGING"
STATE_SEEKING_CHARGER = "SEEKING_CHARGER"
STATE_CLEANING = "CLEANING"
STATE_WANDERING = "WANDERING"
STATE_DEAD = "DEAD"

class RandomAgent(CellAgent):
    def __init__(self, model, cell, energy=100, energy_usage=1, energy_station=5, score=0):
        super().__init__(model)
        self.energy = energy
        self.energy_from_tile = energy_usage
        self.energy_station = energy_station
        self.score = score
        self.cell = cell
        self.known_stations = [cell]
        self.current_state = STATE_WANDERING
        self.movements = 0 

    def step(self):

        self.discover_stations()
        
        self.current_state = self.determine_next_state()
        
        self.execute_state_action()
        
        if self.energy < 0:
            self.remove()

    def determine_next_state(self):
        is_on_station = any(isinstance(obj, StationAgent) for obj in self.cell.agents)
        if is_on_station and self.energy < 100:
            return STATE_CHARGING
        if self.energy < 50:
            return STATE_SEEKING_CHARGER

        is_on_dirty_tile = any(isinstance(obj, FloorAgent) and not obj.fully_clean for obj in self.cell.agents)
        if is_on_dirty_tile:
            return STATE_CLEANING
        return STATE_WANDERING

    def execute_state_action(self):
        if self.current_state == STATE_CHARGING:
            self.charge()
            
        elif self.current_state == STATE_SEEKING_CHARGER:
            self.move_to_station()
            
        elif self.current_state == STATE_CLEANING:
            self.clean()
            
        elif self.current_state == STATE_WANDERING:
            self.wander()



    def charge(self):

        station = next((obj for obj in self.cell.agents if isinstance(obj, StationAgent)), None)
        if station:
            self.energy = min(100, self.energy + self.energy_station)

    def clean(self):

        floor_tile = next((obj for obj in self.cell.agents if isinstance(obj, FloorAgent)), None)
        if floor_tile and not floor_tile.fully_clean:
            self.discharge()
            floor_tile.fully_clean = True
            self.score += 1
            self.movements += 1

    def move_to_station(self):

        nearest_station = self.find_nearest_station()
        

        if nearest_station is None or nearest_station == self.cell:
            self.wander() 
            return


        station_x, station_y = nearest_station.coordinate
        
        empty_neighbors = self.get_empty_neighbors()
        if not empty_neighbors:
            return 


        best_cell = min(
            empty_neighbors,
            key=lambda cell: abs(cell.coordinate[0] - station_x) + abs(cell.coordinate[1] - station_y)
        )
        self.move_agent(best_cell)

    def wander(self):

        empty_neighbors = self.get_empty_neighbors()
        if not empty_neighbors:
            return


        cells_with_dirty_tiles = empty_neighbors.select(
            lambda cell: any(isinstance(obj, FloorAgent) and not obj.fully_clean for obj in cell.agents)
        )
        
        target_cells = cells_with_dirty_tiles if len(cells_with_dirty_tiles) > 0 else empty_neighbors
        random_cell = target_cells.select_random_cell()
        
        self.move_agent(random_cell)

    def move_agent(self, target_cell):

        self.cell = target_cell
        self.discharge()
        self.movements += 1



    def get_empty_neighbors(self):

        return self.cell.neighborhood.select(
            lambda cell: not any(isinstance(obj, ObstacleAgent) for obj in cell.agents)
        )

    def discharge(self):

        self.energy -= self.energy_from_tile

    def discover_stations(self):

        for neighbor_cell in self.cell.neighborhood:
            if any(isinstance(obj, StationAgent) for obj in neighbor_cell.agents):
                self.share_station_location(neighbor_cell)

                for agent in self.model.agents:
                    if isinstance(agent, RandomAgent) and agent != self:
                        agent.share_station_location(neighbor_cell)

    def share_station_location(self, station_cell):
        if station_cell not in self.known_stations:
            self.known_stations.append(station_cell)

    def find_nearest_station(self):
        if not self.known_stations:
            return None
        current_x, current_y = self.cell.coordinate
        return min(
            self.known_stations,
            key=lambda s: abs(s.coordinate[0] - current_x) + abs(s.coordinate[1] - current_y)
        )


class ObstacleAgent(FixedAgent):

    def __init__(self, model, cell):
        super().__init__(model)
        self.cell = cell

    def step(self):
        pass


class StationAgent(FixedAgent):

    def __init__(self, model, cell):

        super().__init__(model)
        self.cell = cell

    def step(self):
        pass


class FloorAgent(FixedAgent):

    @property
    def fully_clean(self):
        return self._fully_clean

    @fully_clean.setter
    def fully_clean(self, value: bool) -> None:
        self._fully_clean = value

    def __init__(self, model, cell, is_clean=False):

        super().__init__(model)
        self.cell = cell
        self._fully_clean = is_clean

    def step(self):
        if self._fully_clean == True:
            self.remove()