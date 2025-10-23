import json, random, time

systemrandom = random.SystemRandom()

class Pattern():
    def __init__(self, data: list[tuple]):
        self.data: list[tuple] = data

    @classmethod
    def from_str(cls, string):
        return cls([tuple(map(int, pos.split(","))) for pos in json.loads(string)])
    
    @classmethod
    def from_json_str(cls, data):
        return cls(list(map(tuple, json.loads(data))))

    def to_json_str(self):
        return json.dumps(self.data)
    
    def __eq__(self, value):
        if not isinstance(value, Pattern):
            return False
    
        time.sleep(systemrandom.uniform(0.001, 0.5)) # prevent timing attacks

        return set(self.data) == set(value.data)