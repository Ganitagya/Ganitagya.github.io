+++
title = "Vectors"
description = "Vectors"
date = "2019-08-23"
aliases = ["data analysis", "data", "date-time", "mathematics"]
author = "Akash Mahapatra"
+++


We, the humans are a highly complex demonstration of a perfectly designed algorithm. Our senses are the perfect instruments to realize that the nature around us is very colorful and diverse. There are a large number of events taking place around us. The winds, the climate, the technological advancements, the function of the human body and all the other varied phenomena occurring around us are somehow inter-depended. The great physicist Dr. R. P. Feynman has wonderfully described what “understanding something” is. Suppose we do not know the rules of chess and we are made to watch a game of chess being played and the moves of the players. If we watch the game for a long time, we may try to guess the rules. With the set of our guessed rules, we may try to conclude why a player played a particular move. We then will evaluate those rules ( that we think are the rules) as the game progresses and will start to discard some of them as we encounter contradictions.

Machine Learning is also analogous to the above-mentioned description of what “understanding” is, here, in this case, the scenario can be of any phenomenon happening around us, like the tech giants launching their flagship products every year, a self-driving car finding its way through our busy streets, online video streaming media suggesting us our next movie or TV series, and the observer will be a machine (or a computer system).

Many of us in our early days of under-graduation may have come across the universally accepted definition of an Algorithm: a process or set of rules to be followed in calculations or to solve a problem. Machine Learning is also about observations made by a computer of a real-world situation and its ability to describe that situation based on certain methods, so the next time something similar happens, the machine will have an explanation. If the description provided by the computer makes sense, it will be registered otherwise it will improvise. For instance, when provided with enough images of dogs and cats, a computer can differentiate between the two animals based on the observations of their unique features.

The description of these phenomena becomes very easy if we have the freedom to use mathematics. Moreover, the techniques of mathematics such as algebra, calculus, statistics, etc. can be used to make predictions from the available data. Consequently, machine learning is all about forming an algorithm that can digest data to produce a prediction. A prediction can be “what is the object in a picture”, or “filtering emails as ‘spam’ or ‘not spam’”, or “what could be the price of the next flagship phone from Google”, or “what is a good combination of certain drugs to cure a certain disease”. Essentially, machine learning is built on mathematical models and our task is to ascertain why a certain model works or why a certain model is better than another.\
There are four fundamental pillars of mathematics supporting the castle of Machine Learning:

Statistics, Calculus, Probability, Linear Algebra

Statistics is the core of any machine learning model. It helps in collecting information from the data relevant for the learning of the model. It is a tool to understand what the numbers are trying to say, in a way, it is a collection of tools that you can use to get answers to important questions about data. Data raises questions, such as:
* What does the data look like?
* What is the most common or expected observation?
* What are the boundaries of the data?

Calculus tells how to make a model learn and optimize the model. Calculus helps to understand how data change over time, how to get the important information out of the data like maxima, minima, shape of the pattern of the data, and to operate on the data once the pattern is recognized. The language of calculus will allow you to speak precisely about the properties of data and better understand their behavior.

Probability helps in predicting the likelihood of an event occurring. The most difficult thing in our universe is that nothing can be measured exactly. There will always be an uncertainty in anything our model predicts. While dealing with real-world situations our models will go through numerous random events which can distort the model very easily if our models are very rigid and not flexible enough to take into consideration the possibility of the unexpected. Our models should be tamed in a way to handle the uncertainty of the real-world problems. That is when probability theory comes to our aid.

Linear algebra helps in running these models on massive datasets. It gives us a set of operations that can be performed on a group of numbers using the concepts of matrices. Linear Algebra is like your sibling who also happens to be a very good friend of your crush. It's a tool that introduces the data of the real world to a mathematical model.

A large portion of machine learning is obtaining a way to properly represent some dataset programmatically to the computer so that it can be consumed by an algorithm.

Any data in the real world can be represented as an ordered tuple in the Cartesian space with each data point being the Cartesian point. Take for example the dataset of the students of a particular school.

| Sno | Name | Age | Standard | Height | Weight |
|-----|------|-----|----------|--------|--------|
| 1 | xyz | 12 | 7 | 140 | 29 |
| 2 | abc | 12 | 7 | 140 | 29 |
| 3 | pqr | 12 | 7 | 140 | 29 |
| 4 | uvw | 12 | 7 | 140 | 29 |

The entire table shown above is a dataset and each row in the dataset is a data point. Each column in the dataset is called a feature.\
Now, consider a 2-dimensional space in the Co-ordinate Geometry scenario. Generally, we call the two dimensions as the X-dimension ( X- direction) and the Y-dimension represented as the X axis and the Y axis.

Any point in this coordinate system will have two components as we call them, the x-component and the y-component and hence, any generic point in this space can be represented as an ordered pair of the x-component and the y-component.\
So, a point P = (x₁,y₁) will be a point which is x₁ distance away towards the right ( x₁ is positive) from the Y-axis and y₁ distance away from the X-axis.

Now comes the fun part ( my teacher’s Catchphrase 😀 ), a vector has a magnitude and a direction, and the point P can be thought of a vector
Let’s denote this vector with Ā.\
The direction of Ā is from origin to the point (x,y)\
Magnitude of Ā, which is generally denoted as ||Ā|| = length of the line-segment from origin to the (x,y) = sqrt(x²+y²)

On the same lines, this concept can be extended to more than 2-dimensions as well.\
Consider an n-dimensional Cartesian space. Any point in this space will have n components which we can call as x₁ component, x₂ component,….,x𝗇 component ( similar to x-component and y-component in a 2 dimensional space) and a generic point in this space P will be (x₁,x₂,….,x𝗇) and the corresponding vector will be in the direction from origin to P.\
Ā = [x₁,x₂,….,x𝗇]\
and its magnitude = sqrt(x₁² + x₂² + …. + x𝗇²)

Any data-set in the real world also contains many features, as mentioned above in the student's dataset, each of which can be considered as a dimension in the real world.\
Let’s consider another example, consider the dataset of measurements of various cars that were produced by a company. Each car on the list has three measurements (or features): length, width, and height. So a given car can be represented as a point in the 3-D space, each dimension corresponding to the individual feature. A car with a length of 4 meters, a height of 3 meters and a width of 3 meters can be represented as below.

The same logic can be extended to a dataset with 300 features which can be represented in 300-Dimensional space. It is very difficult for us to visualize this immense space but machines can do it very easily. For a machine, a vector is a one-dimensional array with size equal to the number of features or dimensions.\
For the above case of the car where a car was represented by 3 features, namely height, width, and length, a data point can be represented as\
Ā = [x,y,z]


In general, if any data point has n features, it can be represented as a vector by considering it as a (1 x n) array. One dimension for each feature. So for a 4-dimensional data point, we can use a 1x4 array to hold its 4 feature values.\
Now consider a set of such data points all represented as 1xn arrays. A collection of all the data points becomes a matrix in the Linear Algebraic world.\
A matrix is a rectangular array of numbers and a vector is a row or a column of a matrix. So each vector of a matrix could represent a different data point with each column being its respective features.

The above-shown students dataset can be represented in a matrix as
S = [\
[ 1, xyz, 12, 7, 140, 29 ]\
[ 2, abc, 12, 7, 140, 29 ]\
[ 3, pqr, 12, 7, 140, 29 ]\
[ 4, uvw, 12, 7, 140, 29 ]\
]

|   | Column 0 | Column 1 | Column 2 | Column 3 | Column 4 | Column 5 |
|---|----------|----------|----------|----------|----------|----------|
| Row 0 | 1 | xyz      | 12       | 7        | 140      | 29       |
| Row 1 | 2 | abc      | 12       | 7        | 140      | 29       |
| Row 2 | 3 | pqr      | 12       | 7        | 140      | 29       |
| Row 3 | 4 | uvw      | 12       | 7        | 140      | 29       |


Once we have represented the data in a suitable format to present to algorithms, the algorithm needs to operate on them. All vector operations can be performed on the data like vector addition, vector subtraction, vector projection, dot product. We generally don’t encounter cross product so we won’t be discussing that here.

--- 

### Addition of vectors
Addition and subtraction of vectors is defined by the Triangle law.

The triangle law is a useful tool if we have been provided the magnitude and direction of the vector, but there is another very easy way. Since we have all the components of the vector along all the dimensions, we can add them component wise to get the resultant vector.
Consider two vectors A and B such that,\
A = [a₁, a₂, …, a𝗇] B = [b₁, b₂, …, b𝗇]\
Then,\
A+B = [ a₁+b₁, a₂+b₂,…, a𝗇+b𝗇 ]

Similarly, subtraction of vectors can be implemented as\
A-B = [ a₁-b₁, a₂-b₂,…, a𝗇-b𝗇 ]


### Distance between two points
Sometimes there are situations where we need to find out the similarity between two given data points. How similar the two given points are. One of the deciding metric to get similarity is the distance between the two points. More similar data points are generally closer as compared to less similar data points.

Let’s consider the IRIS dataset.\
As shown in the above picture, all the similar types of petal are closer to each other.

The distance between two points can be calculated by the below formula:\
||A-B|| = sqrt((a₁-b₁)² + (a₂-b₂)² + … + (a𝗇-b𝗇)²)

### Conventions used:
Before discussing the remaining operations, I would like to discuss one of the conventions used here.\
By default, any vector is a column vector.\
Okay, what’s a column vector now, you ask?

If it a (1 x n) vector then it is called a Row vector, now you guess what could be a column vector.

### Transpose of a Vector
It is an operation wherein the rows of the given matrix are made the columns of the resultant matrix. It is always easy to explain this operation pictorically. Transpose of a matrix A is denoted by Aᵀ

Hence, the transpose of a row vector is a column vector and vice versa.\

### Dot product
It is one of the most extensively used operations on vectors in the field of machine learning. It has a wide range of applications, be it as simple as finding which side of a plane does a point belong to or as complex as dealing with various optimization operations on the models we design, dot product can be found standing vigilantly like the first slip beside the wicketkeeper ( yeah, many things can be learned from Cricket, tell your mother that the next time she asks you to shut the TV down during your exams. I don’t take the responsibility of the after effects though).


Dot Product of two vectors A, B is denoted as A.B and is defined as:\
A.B = abcosθ\
where a = ||A|| = magnitude of the vector A\
b = magnitude of the vector B\
θ = angle between the two vectors A and B

These were some of the basic operations that can be performed on vectors. In this blog post, my aim was to introduce you to the basic concepts of vectors as they are the basic building blocks of advanced concepts in Machine Learning. Once you understand how data is utilized in the computation world, then you can start computing and apply various other techniques to manipulate data and derive information out of them.\
Like any other relationship, this relation also requires a bit of patience and perseverance. Yes, I have always loved mathematics and will continue to do so no matter what. My intention of writing this blog and many others which will follow in this series is to address the absolute beginners who are new to computer science and are exploring things around. In this series of posts, I will be covering the concepts that are used in the field of Machine Learning and will try to make it as easy to comprehend as possible.\
Please comment below on which part did you like the most in this post and which part could have been done in a better way.

Thanks for reading, Cheers !!!

