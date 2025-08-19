import random
from django.core.management.base import BaseCommand
from core.models import ContentItem

class Command(BaseCommand):
	help = 'Seed database with 100 diverse content items'

	def handle(self, *args, **options):
		content_items = [
			# Programming & Technology (30 items)
			{"title": "Introduction to Python Programming", "description": "Learn the basics of Python programming language", "content_type": "video", "tags": ["python", "programming", "beginner"]},
			{"title": "Advanced JavaScript Concepts", "description": "Deep dive into modern JavaScript features", "content_type": "article", "tags": ["javascript", "programming", "advanced"]},
			{"title": "React Hooks Tutorial", "description": "Master React Hooks for functional components", "content_type": "video", "tags": ["react", "javascript", "frontend"]},
			{"title": "Django REST Framework Guide", "description": "Build APIs with Django REST Framework", "content_type": "article", "tags": ["django", "python", "api"]},
			{"title": "Database Design Principles", "description": "Learn relational database design best practices", "content_type": "video", "tags": ["database", "sql", "design"]},
			{"title": "Machine Learning Fundamentals", "description": "Introduction to machine learning concepts", "content_type": "article", "tags": ["machine-learning", "ai", "data-science"]},
			{"title": "Docker Containerization", "description": "Containerize applications with Docker", "content_type": "video", "tags": ["docker", "devops", "containers"]},
			{"title": "Git Version Control", "description": "Master Git for collaborative development", "content_type": "article", "tags": ["git", "version-control", "collaboration"]},
			{"title": "AWS Cloud Computing", "description": "Deploy applications on Amazon Web Services", "content_type": "video", "tags": ["aws", "cloud", "devops"]},
			{"title": "Cybersecurity Basics", "description": "Essential cybersecurity concepts for developers", "content_type": "article", "tags": ["security", "cybersecurity", "best-practices"]},
			{"title": "Data Structures & Algorithms", "description": "Fundamental computer science concepts", "content_type": "video", "tags": ["algorithms", "data-structures", "computer-science"]},
			{"title": "Web Development Best Practices", "description": "Modern web development guidelines", "content_type": "article", "tags": ["web-development", "best-practices", "frontend"]},
			{"title": "API Design Principles", "description": "Design RESTful APIs effectively", "content_type": "video", "tags": ["api", "rest", "design"]},
			{"title": "Testing Strategies", "description": "Comprehensive testing approaches", "content_type": "article", "tags": ["testing", "quality-assurance", "tdd"]},
			{"title": "Performance Optimization", "description": "Optimize application performance", "content_type": "video", "tags": ["performance", "optimization", "monitoring"]},
			{"title": "Microservices Architecture", "description": "Build scalable microservices", "content_type": "article", "tags": ["microservices", "architecture", "scalability"]},
			{"title": "CI/CD Pipeline Setup", "description": "Continuous Integration and Deployment", "content_type": "video", "tags": ["ci-cd", "devops", "automation"]},
			{"title": "GraphQL vs REST", "description": "Compare GraphQL and REST APIs", "content_type": "article", "tags": ["graphql", "rest", "api"]},
			{"title": "Blockchain Development", "description": "Introduction to blockchain technology", "content_type": "video", "tags": ["blockchain", "cryptocurrency", "distributed-systems"]},
			{"title": "Mobile App Development", "description": "Cross-platform mobile development", "content_type": "article", "tags": ["mobile", "react-native", "flutter"]},
			{"title": "Serverless Computing", "description": "Build serverless applications", "content_type": "video", "tags": ["serverless", "aws-lambda", "cloud"]},
			{"title": "Data Visualization", "description": "Create compelling data visualizations", "content_type": "article", "tags": ["data-visualization", "charts", "analytics"]},
			{"title": "Natural Language Processing", "description": "NLP fundamentals and applications", "content_type": "video", "tags": ["nlp", "ai", "machine-learning"]},
			{"title": "Game Development Basics", "description": "Introduction to game development", "content_type": "article", "tags": ["game-development", "unity", "programming"]},
			{"title": "IoT Development", "description": "Internet of Things programming", "content_type": "video", "tags": ["iot", "embedded-systems", "hardware"]},
			{"title": "Big Data Processing", "description": "Handle large-scale data processing", "content_type": "article", "tags": ["big-data", "hadoop", "spark"]},
			{"title": "DevOps Culture", "description": "Implement DevOps practices", "content_type": "video", "tags": ["devops", "culture", "collaboration"]},
			{"title": "Software Architecture Patterns", "description": "Common architectural patterns", "content_type": "article", "tags": ["architecture", "design-patterns", "software-engineering"]},
			{"title": "Cloud Security", "description": "Secure cloud applications", "content_type": "video", "tags": ["cloud-security", "aws", "security"]},
			{"title": "Agile Development", "description": "Agile methodologies and practices", "content_type": "article", "tags": ["agile", "scrum", "project-management"]},

			# Science & Mathematics (25 items)
			{"title": "Calculus Fundamentals", "description": "Essential calculus concepts", "content_type": "video", "tags": ["calculus", "mathematics", "advanced"]},
			{"title": "Linear Algebra Basics", "description": "Introduction to linear algebra", "content_type": "article", "tags": ["linear-algebra", "mathematics", "vectors"]},
			{"title": "Statistics for Data Science", "description": "Statistical concepts for data analysis", "content_type": "video", "tags": ["statistics", "data-science", "analytics"]},
			{"title": "Quantum Physics Introduction", "description": "Basic quantum physics concepts", "content_type": "article", "tags": ["quantum-physics", "physics", "science"]},
			{"title": "Organic Chemistry", "description": "Fundamentals of organic chemistry", "content_type": "video", "tags": ["chemistry", "organic-chemistry", "science"]},
			{"title": "Genetics and DNA", "description": "Understanding genetics and DNA", "content_type": "article", "tags": ["genetics", "biology", "dna"]},
			{"title": "Astronomy Basics", "description": "Introduction to astronomy", "content_type": "video", "tags": ["astronomy", "space", "science"]},
			{"title": "Climate Change Science", "description": "Understanding climate change", "content_type": "article", "tags": ["climate-change", "environment", "science"]},
			{"title": "Neuroscience Fundamentals", "description": "Basic neuroscience concepts", "content_type": "video", "tags": ["neuroscience", "brain", "biology"]},
			{"title": "Evolutionary Biology", "description": "Theory of evolution explained", "content_type": "article", "tags": ["evolution", "biology", "science"]},
			{"title": "Probability Theory", "description": "Mathematical probability concepts", "content_type": "video", "tags": ["probability", "mathematics", "statistics"]},
			{"title": "Number Theory", "description": "Fundamental number theory", "content_type": "article", "tags": ["number-theory", "mathematics", "pure-math"]},
			{"title": "Thermodynamics", "description": "Laws of thermodynamics", "content_type": "video", "tags": ["thermodynamics", "physics", "energy"]},
			{"title": "Ecology Principles", "description": "Basic ecological concepts", "content_type": "article", "tags": ["ecology", "biology", "environment"]},
			{"title": "Meteorology Basics", "description": "Weather and atmospheric science", "content_type": "video", "tags": ["meteorology", "weather", "atmosphere"]},
			{"title": "Geology Fundamentals", "description": "Earth's structure and processes", "content_type": "article", "tags": ["geology", "earth-science", "rocks"]},
			{"title": "Biochemistry", "description": "Chemical processes in living organisms", "content_type": "video", "tags": ["biochemistry", "chemistry", "biology"]},
			{"title": "Electromagnetism", "description": "Electromagnetic theory", "content_type": "article", "tags": ["electromagnetism", "physics", "electricity"]},
			{"title": "Microbiology", "description": "Study of microorganisms", "content_type": "video", "tags": ["microbiology", "biology", "microorganisms"]},
			{"title": "Optics and Light", "description": "Properties of light and optics", "content_type": "article", "tags": ["optics", "physics", "light"]},
			{"title": "Cell Biology", "description": "Structure and function of cells", "content_type": "video", "tags": ["cell-biology", "biology", "cells"]},
			{"title": "Fluid Dynamics", "description": "Study of fluid motion", "content_type": "article", "tags": ["fluid-dynamics", "physics", "mechanics"]},
			{"title": "Plant Biology", "description": "Botany and plant science", "content_type": "video", "tags": ["botany", "biology", "plants"]},
			{"title": "Atomic Physics", "description": "Structure of atoms", "content_type": "article", "tags": ["atomic-physics", "physics", "atoms"]},
			{"title": "Marine Biology", "description": "Ocean life and ecosystems", "content_type": "video", "tags": ["marine-biology", "biology", "ocean"]},

			# Business & Economics (20 items)
			{"title": "Entrepreneurship Fundamentals", "description": "Starting and running a business", "content_type": "video", "tags": ["entrepreneurship", "business", "startup"]},
			{"title": "Marketing Strategies", "description": "Effective marketing approaches", "content_type": "article", "tags": ["marketing", "business", "strategy"]},
			{"title": "Financial Management", "description": "Business financial planning", "content_type": "video", "tags": ["finance", "business", "management"]},
			{"title": "Supply Chain Management", "description": "Managing supply chains effectively", "content_type": "article", "tags": ["supply-chain", "business", "logistics"]},
			{"title": "Human Resources", "description": "HR management principles", "content_type": "video", "tags": ["hr", "business", "management"]},
			{"title": "Project Management", "description": "Project planning and execution", "content_type": "article", "tags": ["project-management", "business", "planning"]},
			{"title": "Business Analytics", "description": "Data-driven business decisions", "content_type": "video", "tags": ["analytics", "business", "data"]},
			{"title": "International Business", "description": "Global business operations", "content_type": "article", "tags": ["international-business", "global", "trade"]},
			{"title": "Corporate Finance", "description": "Financial decision making", "content_type": "video", "tags": ["corporate-finance", "finance", "business"]},
			{"title": "Business Ethics", "description": "Ethical business practices", "content_type": "article", "tags": ["ethics", "business", "responsibility"]},
			{"title": "Operations Management", "description": "Business operations optimization", "content_type": "video", "tags": ["operations", "business", "efficiency"]},
			{"title": "Strategic Management", "description": "Business strategy development", "content_type": "article", "tags": ["strategy", "business", "planning"]},
			{"title": "Digital Marketing", "description": "Online marketing techniques", "content_type": "video", "tags": ["digital-marketing", "marketing", "online"]},
			{"title": "Business Law", "description": "Legal aspects of business", "content_type": "article", "tags": ["business-law", "legal", "compliance"]},
			{"title": "Leadership Skills", "description": "Effective leadership development", "content_type": "video", "tags": ["leadership", "management", "skills"]},
			{"title": "Customer Service", "description": "Excellent customer service", "content_type": "article", "tags": ["customer-service", "business", "service"]},
			{"title": "Business Communication", "description": "Professional communication skills", "content_type": "video", "tags": ["communication", "business", "professional"]},
			{"title": "Risk Management", "description": "Business risk assessment", "content_type": "article", "tags": ["risk-management", "business", "assessment"]},
			{"title": "Innovation Management", "description": "Managing business innovation", "content_type": "video", "tags": ["innovation", "business", "creativity"]},
			{"title": "Business Negotiation", "description": "Effective negotiation skills", "content_type": "article", "tags": ["negotiation", "business", "skills"]},

			# Arts & Humanities (15 items)
			{"title": "Art History Overview", "description": "Major art movements and styles", "content_type": "video", "tags": ["art-history", "art", "culture"]},
			{"title": "Creative Writing", "description": "Fiction and non-fiction writing", "content_type": "article", "tags": ["creative-writing", "writing", "literature"]},
			{"title": "Music Theory", "description": "Fundamentals of music", "content_type": "video", "tags": ["music-theory", "music", "theory"]},
			{"title": "Philosophy Basics", "description": "Introduction to philosophy", "content_type": "article", "tags": ["philosophy", "thinking", "ethics"]},
			{"title": "World Literature", "description": "Classic literature from around the world", "content_type": "video", "tags": ["literature", "books", "culture"]},
			{"title": "Film Studies", "description": "Cinema and film analysis", "content_type": "article", "tags": ["film-studies", "cinema", "media"]},
			{"title": "Photography Techniques", "description": "Digital and film photography", "content_type": "video", "tags": ["photography", "art", "visual"]},
			{"title": "Poetry Writing", "description": "Creating and analyzing poetry", "content_type": "article", "tags": ["poetry", "writing", "literature"]},
			{"title": "Theater Arts", "description": "Drama and theatrical performance", "content_type": "video", "tags": ["theater", "drama", "performance"]},
			{"title": "Cultural Anthropology", "description": "Study of human cultures", "content_type": "article", "tags": ["anthropology", "culture", "society"]},
			{"title": "Graphic Design", "description": "Visual design principles", "content_type": "video", "tags": ["graphic-design", "design", "visual"]},
			{"title": "Linguistics", "description": "Study of language", "content_type": "article", "tags": ["linguistics", "language", "communication"]},
			{"title": "Dance History", "description": "Evolution of dance forms", "content_type": "video", "tags": ["dance", "movement", "culture"]},
			{"title": "Architecture Design", "description": "Building design principles", "content_type": "article", "tags": ["architecture", "design", "buildings"]},
			{"title": "Digital Art", "description": "Creating art with technology", "content_type": "video", "tags": ["digital-art", "art", "technology"]},

			# Health & Wellness (10 items)
			{"title": "Nutrition Fundamentals", "description": "Basic nutrition principles", "content_type": "video", "tags": ["nutrition", "health", "diet"]},
			{"title": "Exercise Science", "description": "Physical fitness and exercise", "content_type": "article", "tags": ["exercise", "fitness", "health"]},
			{"title": "Mental Health Awareness", "description": "Understanding mental health", "content_type": "video", "tags": ["mental-health", "psychology", "wellness"]},
			{"title": "Yoga and Meditation", "description": "Mind-body wellness practices", "content_type": "article", "tags": ["yoga", "meditation", "wellness"]},
			{"title": "Anatomy and Physiology", "description": "Human body structure and function", "content_type": "video", "tags": ["anatomy", "physiology", "biology"]},
			{"title": "Public Health", "description": "Community health principles", "content_type": "article", "tags": ["public-health", "health", "community"]},
			{"title": "Sports Medicine", "description": "Athletic injury prevention", "content_type": "video", "tags": ["sports-medicine", "health", "athletics"]},
			{"title": "Alternative Medicine", "description": "Complementary health approaches", "content_type": "article", "tags": ["alternative-medicine", "health", "holistic"]},
			{"title": "Epidemiology", "description": "Disease patterns and prevention", "content_type": "video", "tags": ["epidemiology", "health", "disease"]},
			{"title": "Health Psychology", "description": "Psychological aspects of health", "content_type": "article", "tags": ["health-psychology", "psychology", "health"]},
		]

		# Add some quizzes
		quiz_items = [
			{"title": "Python Programming Quiz", "description": "Test your Python knowledge", "content_type": "quiz", "tags": ["python", "programming", "quiz"]},
			{"title": "Mathematics Challenge", "description": "Advanced math problems", "content_type": "quiz", "tags": ["mathematics", "quiz", "problem-solving"]},
			{"title": "Science Trivia", "description": "General science knowledge", "content_type": "quiz", "tags": ["science", "quiz", "trivia"]},
			{"title": "Business Concepts Test", "description": "Business fundamentals quiz", "content_type": "quiz", "tags": ["business", "quiz", "concepts"]},
			{"title": "Art History Quiz", "description": "Test your art knowledge", "content_type": "quiz", "tags": ["art", "quiz", "history"]},
		]

		all_items = content_items + quiz_items

		created_count = 0
		for item_data in all_items:
			# Add some random URLs for variety
			if item_data["content_type"] == "video":
				item_data["url"] = f"https://example.com/videos/{item_data['title'].lower().replace(' ', '-')}"
			elif item_data["content_type"] == "article":
				item_data["url"] = f"https://example.com/articles/{item_data['title'].lower().replace(' ', '-')}"
			elif item_data["content_type"] == "quiz":
				item_data["url"] = f"https://example.com/quizzes/{item_data['title'].lower().replace(' ', '-')}"

			ContentItem.objects.get_or_create(
				title=item_data["title"],
				defaults=item_data
			)
			created_count += 1

		self.stdout.write(
			self.style.SUCCESS(f'Successfully created {created_count} content items')
		)

