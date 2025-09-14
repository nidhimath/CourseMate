"""
Topic classification service using Claude API
"""

import os
import json
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

classify_bp = Blueprint('classify', __name__)

@classify_bp.route('/topic', methods=['POST'])
def classify_topic():
    """
    Classify lesson content to identify the primary topic covered
    """
    try:
        data = request.get_json()
        content = data.get('content')
        course_code = data.get('courseCode')

        if not content or not course_code:
            return jsonify({
                'error': 'Content and courseCode are required'
            }), 400

        # Currently only supporting CS162
        if course_code != 'CS162':
            return jsonify({
                'error': 'Topic classification only supported for CS162'
            }), 400

        # Load topics from JSON file
        topics_file_path = os.path.join(os.path.dirname(__file__), '..', 'nextjs-frontend', 'src', 'public', 'topics_CS162.json')
        
        if not os.path.exists(topics_file_path):
            return jsonify({
                'error': 'Topics file not found'
            }), 500

        with open(topics_file_path, 'r', encoding='utf-8') as f:
            topics_data = json.load(f)
        
        available_topics = list(topics_data.keys())

        # Get Claude API key from environment
        claude_api_key = os.getenv('ANTHROPIC_API_KEY')
        if not claude_api_key:
            return jsonify({
                'error': 'Claude API key not configured'
            }), 500

        # Create the prompt for Claude
        prompt = f"""Given this CS162 lesson content and the following list of topics, identify which SINGLE topic this lesson primarily covers.

Available topics:
{chr(10).join([f"- {topic}" for topic in available_topics])}

Lesson content:
{content}

Instructions:
- Analyze the lesson content carefully
- Identify the main topic that this lesson is teaching
- Respond with ONLY the exact topic name from the list above that best matches this lesson content
- If no topic matches well, respond with the closest match
- Do not include any explanation, just the topic name

Topic:"""

        # Call Claude API
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': claude_api_key,
            'anthropic-version': '2023-06-01'
        }

        payload = {
            'model': 'claude-sonnet-4-20250514',
            'max_tokens': 100,
            'messages': [{
                'role': 'user',
                'content': prompt
            }]
        }

        claude_response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers=headers,
            json=payload,
            timeout=30
        )

        if not claude_response.ok:
            error_text = claude_response.text
            print(f'Claude API error: {error_text}')
            return jsonify({
                'error': 'Failed to classify topic with Claude API'
            }), 500

        claude_result = claude_response.json()
        identified_topic = claude_result.get('content', [{}])[0].get('text', '').strip()

        # Validate that the identified topic is in our list
        if not identified_topic or identified_topic not in available_topics:
            # Try to find the closest match
            lower_case_identified = identified_topic.lower() if identified_topic else ''
            closest_match = None
            
            for topic in available_topics:
                if (lower_case_identified in topic.lower() or 
                    topic.lower() in lower_case_identified):
                    closest_match = topic
                    break

            if closest_match:
                return jsonify({'topic': closest_match})

            # Fallback to a default topic if no good match found
            return jsonify({
                'topic': available_topics[0],  # Default to first topic
                'warning': 'Could not accurately classify topic, using default'
            })

        return jsonify({'topic': identified_topic})

    except Exception as error:
        print(f'Error in topic classification: {error}')
        return jsonify({
            'error': 'Internal server error'
        }), 500
