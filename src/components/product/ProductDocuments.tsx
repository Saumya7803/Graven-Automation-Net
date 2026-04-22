import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, Award, FileCheck, Download } from "lucide-react";

interface ProductDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_size_kb: number;
}

interface ProductDocumentsProps {
  documents: ProductDocument[];
}

const getDocumentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'datasheet':
      return <FileText className="h-5 w-5" />;
    case 'manual':
      return <BookOpen className="h-5 w-5" />;
    case 'certificate':
      return <Award className="h-5 w-5" />;
    default:
      return <FileCheck className="h-5 w-5" />;
  }
};

export const ProductDocuments = ({ documents }: ProductDocumentsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Download className="h-5 w-5 text-primary" />
          Documents & Downloads
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
                  <div className="text-primary flex-shrink-0 mt-1">
                    {getDocumentIcon(doc.document_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words line-clamp-2 sm:line-clamp-1">
                      {doc.document_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {doc.document_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(doc.file_size_kb / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto flex-shrink-0" asChild>
                  <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No documents available for download at this time. Contact us for technical documentation.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
