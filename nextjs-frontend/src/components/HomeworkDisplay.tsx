'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Clock, 
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Problem {
  number: number;
  title: string;
  points: number;
  learning_notes: {
    core_concepts: string[];
    key_tradeoffs: string[];
  };
  parts: Array<{
    letter: string;
    description: string;
    key_information: string[];
    leading_questions: string[];
  }>;
  check_understanding: string;
}

interface HomeworkData {
  title: string;
  problems: Problem[];
  metadata: {
    source_file: string;
    uploaded_at: string;
    total_problems: number;
  };
}

interface HomeworkDisplayProps {
  homeworkData: HomeworkData;
  onDelete: () => void;
}

export default function HomeworkDisplay({ homeworkData, onDelete }: HomeworkDisplayProps) {
  const [expandedProblems, setExpandedProblems] = useState<Set<number>>(new Set());
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  const toggleProblem = (problemNumber: number) => {
    const newExpanded = new Set(expandedProblems);
    if (newExpanded.has(problemNumber)) {
      newExpanded.delete(problemNumber);
    } else {
      newExpanded.add(problemNumber);
    }
    setExpandedProblems(newExpanded);
  };

  const togglePart = (partId: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{homeworkData.title}</CardTitle>
                <CardDescription>
                  Uploaded from {homeworkData.metadata.source_file} • {formatDate(homeworkData.metadata.uploaded_at)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {homeworkData.metadata.total_problems} problems
              </Badge>
              <Button variant="outline" size="sm" onClick={onDelete}>
                Replace Assignment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Problems */}
      <div className="space-y-4">
        {homeworkData.problems.map((problem) => (
          <Card key={problem.number} className="overflow-hidden">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleProblem(problem.number)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedProblems.has(problem.number) ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          Problem {problem.number}: {problem.title}
                        </CardTitle>
                        <CardDescription>
                          {problem.parts.length} part{problem.parts.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {problem.points} pts
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Learning Notes */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Learning Notes
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Core Concepts */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-blue-700">Core Concepts</h5>
                        <ul className="space-y-1">
                          {problem.learning_notes.core_concepts.map((concept, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              {concept}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Key Tradeoffs */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-orange-700">Key Tradeoffs</h5>
                        <ul className="space-y-1">
                          {problem.learning_notes.key_tradeoffs.map((tradeoff, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                              {tradeoff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Problem Parts */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Problem Breakdown</h4>
                    
                    {problem.parts.map((part) => {
                      const partId = `${problem.number}-${part.letter}`;
                      return (
                        <Card key={partId} className="border-l-4 border-l-blue-500">
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <CardHeader 
                                className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
                                onClick={() => togglePart(partId)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {expandedParts.has(partId) ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                    <div>
                                      <CardTitle className="text-base">
                                        Part ({part.letter}): {part.description}
                                      </CardTitle>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="space-y-4">
                                {/* Key Information */}
                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-blue-500" />
                                    Key Information
                                  </h5>
                                  <ul className="space-y-1">
                                    {part.key_information.map((info, index) => (
                                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                        {info}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {/* Leading Questions */}
                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                                    Leading Questions
                                  </h5>
                                  <ol className="space-y-2">
                                    {part.leading_questions.map((question, index) => (
                                      <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-medium">
                                          {index + 1}
                                        </span>
                                        {question}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Check Your Understanding */}
                  {problem.check_understanding && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Check Your Understanding
                      </h4>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                        {problem.check_understanding}
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}
