import numpy as np

class QLearningAgent:
    def __init__(self, states, actions, rewards, learning_rate=0.1, discount_factor=0.9):
        self.states = states  # List of states
        self.actions = actions  # List of actions
        self.rewards = rewards  # Reward structure
        self.learning_rate = learning_rate  # Learning rate
        self.discount_factor = discount_factor  # Discount factor
        self.Q = np.zeros((len(states), len(actions)))  # Q-table

    def choose_action(self, state_index):
        # Choose the action with the highest Q-value for the current state
        return np.argmax(self.Q[state_index])

    def update_Q(self, state_index, action_index, reward):
        # Update the Q-value using the Q-learning formula
        best_future_q = np.max(self.Q[state_index])
        self.Q[state_index, action_index] += self.learning_rate * (reward + self.discount_factor * best_future_q - self.Q[state_index, action_index])

    def train(self, num_episodes):
        for episode in range(num_episodes):
            for state_index, state in enumerate(self.states):
                for action_index, action in enumerate(self.actions):
                    # Get the reward based on the current state and action
                    reward = self.rewards[state][action_index]
                    self.update_Q(state_index, action_index, reward)

    def get_Q_table(self):
        return self.Q

# Define the environment
states = ["Healthy", "Unhealthy"]
actions = ["Choose", "Ignore"]
rewards = {
    "Healthy": [1, 0],    # Reward for choosing vs ignoring a healthy food
    "Unhealthy": [-1, 0]   # Reward for choosing vs ignoring an unhealthy food
}

# Create the agent and train it
agent = QLearningAgent(states, actions, rewards)
agent.train(num_episodes=10)

# Display the learned Q-table
print("Learned Q-values:")
print(agent.get_Q_table())
