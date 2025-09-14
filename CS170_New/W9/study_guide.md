# Chapter 7 - Linear programming and reductions

### 7.1.2 Example: production planning

This week, we will be going over Examples of Linear Programming, and how we can break down the problems further

This time, our company makes handwoven carpets, a product for which the demand is extremely seasonal. Our analyst has just obtained demand estimates for all months of the next calendar year: d₁, d₂, ..., d₁₂. As feared, they are very uneven, ranging from 440 to 920.

Here's a quick snapshot of the company. We currently have 30 employees, each of whom makes 20 carpets per month and gets a monthly salary of $2,000. We have no initial surplus of carpets.

How can we handle the fluctuations in demand? There are three ways:

1. Overtime, but this is expensive since overtime pay is 80% more than regular pay. Also, workers can put in at most 30% overtime.

2. Hiring and firing, but these cost $320 and $400, respectively, per worker.

3. Storing surplus production, but this costs $8 per carpet per month. We currently have no stored carpets on hand, and we must end the year without any carpets stored.

This rather involved problem can be formulated and solved as a linear program!

A crucial first step is defining the variables.

wᵢ = number of workers during ith month; w₀ = 30.
xᵢ = number of carpets made during ith month.
oᵢ = number of carpets made by overtime in month i.
hᵢ, fᵢ = number of workers hired and fired, respectively, at beginning of month i.
sᵢ = number of carpets stored at end of month i; s₀ = 0.

All in all, there are 72 variables (74 if you count w₀ and s₀).

We now write the constraints. First, all variables must be nonnegative:

wᵢ, xᵢ, oᵢ, hᵢ, fᵢ, sᵢ ≥ 0, i = 1, ..., 12.

The total number of carpets made per month consists of regular production plus overtime:

xᵢ = 20wᵢ + oᵢ

(one constraint for each i = 1, ..., 12). The number of workers can potentially change at the start of each month:

wᵢ = wᵢ₋₁ + hᵢ - fᵢ.

The number of carpets stored at the end of each month is what we started with, plus the number we made, minus the demand for the month:

sᵢ = sᵢ₋₁ + xᵢ - dᵢ.

And overtime is limited:

oᵢ ≤ 6wᵢ.

Finally, what is the objective function? It is to minimize the total cost:

min 2000 Σᵢ wᵢ + 320 Σᵢ hᵢ + 400 Σᵢ fᵢ + 8 Σᵢ sᵢ + 180 Σᵢ oᵢ,

a linear function of the variables. Solving this linear program by simplex should take less than a second and will give us the optimum business strategy for our company.

Well, almost. The optimum solution might turn out to be fractional; for instance, it might involve hiring 10.6 workers in the month of March. This number would have to be rounded to either 10 or 11 in order to make sense, and the overall cost would then increase correspondingly. In the present example, most of the variables take on fairly large (double-digit) values, and thus rounding is unlikely to affect things too much. There are other LPs, however, in which rounding decisions have to be made very carefully in order to end up with an integer solution of reasonable quality.

In general, there is a tension in linear programming between the ease of obtaining fractional solutions and the desirability of integer ones. As we shall see in Chapter 8, finding the optimum integer solution of an LP is an important but very hard problem, called integer linear programming.

### 7.1.3 Example: optimum bandwidth allocation

Next we turn to a miniaturized version of the kind of problem a network service provider might face.

Suppose we are managing a network whose lines have the bandwidths shown in Figure 7.3, and we need to establish three connections: between users A and B, between B and C, and between A and C. Each connection requires at least two units of bandwidth, but can be assigned more. Connection A–B pays $3 per unit of bandwidth, and connections B–C and A–C pay $2 and $4, respectively.

Each connection can be routed in two ways, a long path and a short path, or by a combination: for instance, two units of bandwidth via the short route, one via the long route. How do we route these connections to maximize our network's revenue?

This is a linear program. We have variables for each connection and each path (long or short); for example, x_{AB} is the short-path bandwidth allocated to the connection between A and B, and x'_{AB} the long-path bandwidth for this same connection. We demand that no edge's bandwidth is exceeded and that each connection gets a bandwidth of at least 2 units.

max 3x_{AB} + 3x'_{AB} + 2x_{BC} + 2x'_{BC} + 4x_{AC} + 4x'_{AC}

x_{AB} + x'_{AB} + x_{BC} + x'_{BC} ≤ 10    [edge (b, B)]
x_{AB} + x'_{AB} + x_{AC} + x'_{AC} ≤ 12    [edge (a, A)]
x_{BC} + x'_{BC} + x_{AC} + x'_{AC} ≤ 8     [edge (c, C)]
x_{AB} + x'_{BC} + x'_{AC} ≤ 6              [edge (a, b)]
x'_{AB} + x_{BC} + x'_{AC} ≤ 13             [edge (b, c)]
x'_{AB} + x'_{BC} + x_{AC} ≤ 11             [edge (a, c)]
x_{AB} + x'_{AB} ≥ 2
x_{BC} + x'_{BC} ≥ 2
x_{AC} + x'_{AC} ≥ 2
x_{AB}, x'_{AB}, x_{BC}, x'_{BC}, x_{AC}, x'_{AC} ≥ 0

Even a tiny example like this one is hard to solve on one's own (try it!), and yet the optimal solution is obtained instantaneously via simplex:

x_{AB} = 0, x'_{AB} = 7, x_{BC} = x'_{BC}