import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { AskQuestionDialog } from "./AskQuestionDialog";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export const FAQAccordion = ({ faqs }: FAQAccordionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<Record<number, "helpful" | "not-helpful" | null>>({});
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFeedback = (index: number, type: "helpful" | "not-helpful") => {
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === type ? null : type,
    }));
  };

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about our VFD products and services
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* FAQs */}
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <p className="mb-4">{faq.answer}</p>
                    
                    {/* Feedback Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">Was this helpful?</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(index, "helpful")}
                          className={feedback[index] === "helpful" ? "bg-green-50 border-green-500" : ""}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(index, "not-helpful")}
                          className={feedback[index] === "not-helpful" ? "bg-red-50 border-red-500" : ""}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No FAQs found matching your search.</p>
              <Button variant="outline" onClick={() => setIsAskQuestionOpen(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for?
            </p>
            <Button size="lg" onClick={() => setIsAskQuestionOpen(true)}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask a Question
            </Button>
          </div>
        </div>
      </div>

      <AskQuestionDialog 
        open={isAskQuestionOpen} 
        onOpenChange={setIsAskQuestionOpen}
      />
    </section>
  );
};
