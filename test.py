from itertools import permutations

def string_combinations(lst):
    for i in range(len(lst), len(lst)+1):
        for combination in permutations(lst, i):
            print(''.join(combination))

# Example
string_combinations(['T', 'L', "R", "EI", "E"])