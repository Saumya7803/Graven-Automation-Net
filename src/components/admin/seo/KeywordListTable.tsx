import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface KeywordListTableProps {
  keywords: any[];
  onEdit: (keyword: any) => void;
  onDelete: (id: string) => void;
}

const KeywordListTable = ({ keywords, onEdit, onDelete }: KeywordListTableProps) => {
  const getTypeColor = (type: string) => {
    const colors = {
      location: "bg-blue-500",
      product_model: "bg-green-500",
      power_rating: "bg-emerald-500",
      industry: "bg-yellow-500",
      commercial: "bg-purple-500",
      informational: "bg-cyan-500",
      near_me: "bg-orange-500",
      international: "bg-pink-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "text-red-600 font-bold";
    if (priority === 2) return "text-orange-600 font-semibold";
    if (priority === 3) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Search Volume</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Series/Power</TableHead>
            <TableHead>Target Page</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No keywords found. Add your first keyword to get started.
              </TableCell>
            </TableRow>
          ) : (
            keywords.map((keyword) => (
              <TableRow key={keyword.id}>
                <TableCell className="font-medium">{keyword.keyword}</TableCell>
                <TableCell>
                  <Badge className={`${getTypeColor(keyword.keyword_type)} text-white`}>
                    {keyword.keyword_type}
                  </Badge>
                </TableCell>
                <TableCell>{keyword.search_volume || "-"}</TableCell>
                <TableCell>{keyword.keyword_difficulty || "-"}</TableCell>
                <TableCell className={getPriorityColor(keyword.priority)}>
                  P{keyword.priority}
                </TableCell>
                <TableCell>
                  {keyword.city ? (
                    <span className="text-sm">
                      {keyword.city}
                      {keyword.state && `, ${keyword.state}`}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {keyword.product_series || keyword.power_rating || "-"}
                </TableCell>
                <TableCell>
                  {keyword.target_url ? (
                    <Link
                      to={keyword.target_url}
                      className="text-primary hover:underline flex items-center gap-1"
                      target="_blank"
                    >
                      <span className="text-xs">{keyword.target_page_type}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-xs">Not mapped</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={keyword.is_active ? "default" : "secondary"}>
                    {keyword.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(keyword)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(keyword.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KeywordListTable;
