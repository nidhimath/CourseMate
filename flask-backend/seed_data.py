from app import app, db
from models import User, Course, Lesson, Concept, Exercise
from datetime import datetime
import json

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if data already exists
        if Course.query.first():
            print("Database already seeded")
            return
        
        # Create courses
        cs170 = Course(
            code='CS 170',
            name='Efficient Algorithms and Intractable Problems',
            description='Concept and basic techniques in the design and analysis of algorithms; models of computation; lower bounds; algorithms for optimum search trees, balanced trees, VLSI layout, number theory.',
            instructor='Prof. Satish Rao',
            semester='Spring 2024',
            units=4
        )
        
        eecs16a = Course(
            code='EECS 16A',
            name='Designing Information Devices and Systems I',
            description='Linear algebra, basic circuit analysis, and design of information devices and systems.',
            instructor='Prof. Miki Lustig',
            semester='Spring 2024',
            units=4
        )
        
        math54 = Course(
            code='Math 54',
            name='Linear Algebra and Differential Equations',
            description='Linear algebra: matrix arithmetic, determinants, eigenvectors. Differential equations: first and second order.',
            instructor='Prof. Richard Bamler',
            semester='Spring 2024',
            units=4
        )
        
        db.session.add_all([cs170, eecs16a, math54])
        db.session.commit()
        
        # Create lessons for CS 170
        lessons_data = [
            {
                'title': 'Course Introduction & Asymptotic Analysis',
                'description': 'Overview of algorithmic thinking and Big-O notation review',
                'week': 1,
                'order': 1,
                'duration': 45,
                'difficulty': 'Beginner'
            },
            {
                'title': 'Divide and Conquer Algorithms',
                'description': 'Master theorem and recursive algorithm analysis',
                'week': 1,
                'order': 2,
                'duration': 60,
                'difficulty': 'Intermediate'
            },
            {
                'title': 'Advanced Sorting Algorithms',
                'description': 'Beyond comparison sorts: counting, radix, and bucket sort',
                'week': 1,
                'order': 3,
                'duration': 50,
                'difficulty': 'Intermediate'
            },
            {
                'title': 'Graph Algorithms Fundamentals',
                'description': 'Graph representations and basic traversal algorithms',
                'week': 2,
                'order': 1,
                'duration': 55,
                'difficulty': 'Intermediate'
            },
            {
                'title': 'BFS, DFS and Applications',
                'description': 'Breadth-first and depth-first search with practical applications',
                'week': 2,
                'order': 2,
                'duration': 65,
                'difficulty': 'Intermediate'
            },
            {
                'title': "Dijkstra's Algorithm",
                'description': "Learn shortest path algorithms using familiar concepts from CS 61B",
                'week': 3,
                'order': 1,
                'duration': 70,
                'difficulty': 'Advanced'
            },
            {
                'title': 'Minimum Spanning Trees',
                'description': "Kruskal's and Prim's algorithms for MST construction",
                'week': 3,
                'order': 2,
                'duration': 55,
                'difficulty': 'Intermediate'
            },
            {
                'title': 'Dynamic Programming Introduction',
                'description': 'Optimal substructure and overlapping subproblems',
                'week': 4,
                'order': 1,
                'duration': 75,
                'difficulty': 'Advanced'
            }
        ]
        
        lessons = []
        for lesson_data in lessons_data:
            lesson = Lesson(
                course_id=cs170.id,
                title=lesson_data['title'],
                description=lesson_data['description'],
                week=lesson_data['week'],
                order=lesson_data['order'],
                duration=lesson_data['duration'],
                difficulty=lesson_data['difficulty']
            )
            lessons.append(lesson)
        
        db.session.add_all(lessons)
        db.session.commit()
        
        # Get the Dijkstra lesson for detailed content
        dijkstra_lesson = Lesson.query.filter_by(title="Dijkstra's Algorithm").first()
        
        # Create concepts for Dijkstra lesson
        concept1 = Concept(
            lesson_id=dijkstra_lesson.id,
            title="What is Dijkstra's Algorithm?",
            content="""Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph. Think of it like the **breadth-first search** you mastered in CS 61B, but now we're considering edge weights.

In CS 61B, you learned that BFS explores nodes level by level. Dijkstra's algorithm is similar, but instead of exploring by "levels," it explores by **distance from the source**. Just like how you used a **priority queue** for your A* implementation in the Berkeley Maps project!

The key insight: always process the **closest unvisited vertex** next. This greedy choice guarantees we find the shortest path, just like how the greedy approach worked for minimum spanning trees.""",
            order=1,
            analogy="Think of this like the BFS approach in CS 61B - we explored neighbors systematically, but now we prioritize by distance rather than discovery order.",
            cs61b_connection="This builds directly on your BFS and priority queue knowledge from CS 61B."
        )
        
        concept2 = Concept(
            lesson_id=dijkstra_lesson.id,
            title="The Algorithm Step-by-Step",
            content="""Here's how Dijkstra's works, broken down like the **step-by-step debugging** we practiced in CS 61B:

1. **Initialize**: Set distance to source as 0, all others as infinity (like initializing your distance array in BFS)
2. **Priority Queue**: Add all vertices to a min-heap ordered by distance (remember **MinPQ** from your data structures?)
3. **Extract minimum**: Remove the vertex with smallest distance (like `removeMin()` in your heap implementation)
4. **Relax edges**: For each neighbor, check if going through current vertex gives a shorter path
5. **Update distances**: If shorter path found, update distance and parent (like updating your `distTo` array)

The **relaxation** step is key - it's like updating your best path when you find a better route, similar to how you updated shortest paths in your graph algorithms project.""",
            order=2,
            analogy="This is exactly like your CS 61B shortest path lab, but now we're using edge weights instead of uniform costs!",
            cs61b_connection="Same data structures and patterns you used in CS 61B graph algorithms."
        )
        
        db.session.add_all([concept1, concept2])
        db.session.commit()
        
        # Create exercises for Dijkstra lesson
        exercise1 = Exercise(
            lesson_id=dijkstra_lesson.id,
            title="🎯 Quick Check: BFS vs Dijkstra's",
            problem="Given this simple graph, compare how BFS and Dijkstra's would explore vertices starting from A. What's the key difference?",
            hints=json.dumps([
                'BFS uses a regular queue (FIFO)',
                'Dijkstra\'s uses a priority queue (min-heap)',
                'BFS finds shortest path in unweighted graphs',
                'Dijkstra\'s considers edge weights'
            ]),
            order=1,
            cs61b_connection="Remember your BFS implementation from CS 61B? Dijkstra's is almost identical, just swap the queue for a priority queue!"
        )
        
        exercise2 = Exercise(
            lesson_id=dijkstra_lesson.id,
            title="📝 Trace Dijkstra's Algorithm",
            problem="Given the weighted graph below, trace Dijkstra's algorithm starting from vertex A. Show the priority queue state and distance updates at each step.",
            hints=json.dumps([
                'Start with distance[A] = 0, all others = ∞',
                'Use a priority queue to always process the closest unvisited vertex',
                'For each vertex, relax all outgoing edges',
                'Update the priority queue when distances change'
            ]),
            solution="Step 1: Initialize distances, Step 2: Process vertex A, Step 3: Relax edges A→B, A→C...",
            order=2,
            cs61b_connection="This is exactly like tracing BFS, but we prioritize by distance instead of discovery order."
        )
        
        db.session.add_all([exercise1, exercise2])
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
