import type { ProcessedDocument, TutorMessage, StudyNote } from "@/types";

export const MOCK_DOCUMENT: ProcessedDocument = {
  id: "mock-doc-1",
  name: "Introduction to Machine Learning.pdf",
  uploadedAt: new Date().toISOString(),
  pageCount: 8,
  fullText: `Introduction to Machine Learning

Chapter 1: What is Machine Learning?

Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

The process begins with observations or data, such as examples, direct experience, or instruction, so that computers can look for patterns in data and make better decisions in the future. The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.

Chapter 2: Types of Machine Learning

There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.

Supervised Learning
In supervised learning, the algorithm is trained on labeled data. The model learns to map inputs to outputs based on example input-output pairs. Common applications include image classification, spam detection, and medical diagnosis. Examples of supervised learning algorithms include linear regression, logistic regression, decision trees, and neural networks.

Unsupervised Learning
Unsupervised learning involves finding hidden patterns in data without labeled responses. The algorithm explores data to find structure on its own. Common techniques include clustering (K-means, hierarchical clustering), dimensionality reduction (PCA, t-SNE), and generative models.

Reinforcement Learning
In reinforcement learning, an agent learns to behave in an environment by performing actions and observing rewards. The agent seeks to maximize cumulative reward over time. Key concepts include the agent, environment, state, action, and reward. Applications include game playing (AlphaGo), robotics, and autonomous vehicles.

Chapter 3: Key ML Algorithms

Linear Regression is used for predicting continuous values. It assumes a linear relationship between inputs and output. The model finds the best-fit line by minimizing the sum of squared errors.

Decision Trees make decisions by splitting data based on feature values. They are intuitive and easy to interpret. Random Forests combine many decision trees to improve accuracy and reduce overfitting.

Neural Networks are inspired by the structure of the human brain. They consist of layers of interconnected neurons. Deep learning uses neural networks with many layers to learn complex patterns from large amounts of data.

Chapter 4: The ML Workflow

A typical machine learning project follows these steps: problem definition, data collection, data preprocessing, feature engineering, model selection, model training, evaluation, and deployment.

Data preprocessing is crucial. It includes handling missing values, normalizing features, encoding categorical variables, and splitting data into training and test sets. The quality of data significantly impacts model performance — "garbage in, garbage out."

Model evaluation uses metrics such as accuracy, precision, recall, F1-score for classification, and MSE, RMSE, R² for regression. Cross-validation is used to estimate how the model generalizes to unseen data.

Chapter 5: Overfitting and Underfitting

Overfitting occurs when a model learns the training data too well, including its noise and outliers. The model performs well on training data but poorly on new, unseen data. Techniques to prevent overfitting include regularization (L1/L2), dropout, cross-validation, and getting more training data.

Underfitting occurs when a model is too simple to capture the underlying patterns in the data. Both training and test performance are poor. Solutions include using a more complex model, adding more features, or reducing regularization.

The balance between overfitting and underfitting is known as the bias-variance tradeoff. High bias leads to underfitting; high variance leads to overfitting. The goal is to find a model with low bias and low variance.`,
  chunks: [
    {
      id: "chunk-1",
      index: 0,
      label: "Chapter 1: What is ML?",
      text: `Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

The process begins with observations or data, such as examples, direct experience, or instruction, so that computers can look for patterns in data and make better decisions in the future. The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.`,
    },
    {
      id: "chunk-2",
      index: 1,
      label: "Chapter 2: Types of ML",
      text: `There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.

Supervised Learning: The algorithm is trained on labeled data. Common applications include image classification, spam detection, and medical diagnosis.

Unsupervised Learning: Involves finding hidden patterns in data without labeled responses. Common techniques include clustering and dimensionality reduction.

Reinforcement Learning: An agent learns by performing actions and observing rewards. Applications include game playing, robotics, and autonomous vehicles.`,
    },
    {
      id: "chunk-3",
      index: 2,
      label: "Chapter 3: Key Algorithms",
      text: `Linear Regression is used for predicting continuous values. It finds the best-fit line by minimizing the sum of squared errors.

Decision Trees make decisions by splitting data based on feature values. Random Forests combine many decision trees to improve accuracy.

Neural Networks are inspired by the human brain. Deep learning uses many layers to learn complex patterns from large amounts of data.`,
    },
    {
      id: "chunk-4",
      index: 3,
      label: "Chapter 4: The ML Workflow",
      text: `A typical machine learning project: problem definition → data collection → data preprocessing → feature engineering → model selection → training → evaluation → deployment.

Data preprocessing includes handling missing values, normalizing features, and splitting data. "Garbage in, garbage out."

Model evaluation uses accuracy, precision, recall for classification; MSE, RMSE for regression. Cross-validation estimates generalization.`,
    },
    {
      id: "chunk-5",
      index: 4,
      label: "Chapter 5: Overfitting & Underfitting",
      text: `Overfitting: model learns training data too well, performs poorly on new data. Prevention: regularization, dropout, more data.

Underfitting: model too simple to capture patterns. Both training and test performance are poor.

Bias-variance tradeoff: high bias → underfitting; high variance → overfitting. The goal is low bias and low variance.`,
    },
  ],
};

export const MOCK_MESSAGES: TutorMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "Hi! I've read **Introduction to Machine Learning**. I'm ready to help you understand the material. You can ask me anything, or use the quick actions above to explain a section, take a quiz, or generate flashcards.",
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "msg-2",
    role: "user",
    content: "Can you explain supervised learning in simple terms?",
    createdAt: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: "msg-3",
    role: "assistant",
    content:
      "Think of **supervised learning** like learning with a teacher who shows you examples with correct answers.\n\nFor instance, imagine showing a child thousands of pictures of cats and dogs, each labeled with the right answer. Over time, the child learns to recognize the patterns that distinguish a cat from a dog — and can then correctly identify new pictures they've never seen before.\n\nIn the notes, it's defined as: *\"the algorithm is trained on labeled data\"* — meaning every training example comes with the correct answer attached.\n\n**Real examples from the material:**\n- Spam detection (email labeled as spam or not spam)\n- Medical diagnosis (patient data labeled with diagnosis)\n- Image classification\n\nThe key idea: the model learns a *mapping* from inputs → outputs using many labeled examples.",
    createdAt: new Date(Date.now() - 30000).toISOString(),
    sourceChunkIds: ["chunk-2"],
  },
];

export const MOCK_STUDY_NOTES: StudyNote[] = [
  {
    id: "note-1",
    type: "explanation",
    title: "Supervised Learning — simple explanation",
    content:
      "Supervised learning = learning with labeled examples. Like showing a child labeled pictures. The model learns input→output mapping. Used for spam detection, image classification, medical diagnosis.",
    savedAt: new Date(Date.now() - 30000).toISOString(),
  },
];
