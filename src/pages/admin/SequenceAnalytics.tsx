import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Users, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function SequenceAnalytics() {
  const { data: sequences, isLoading } = useQuery({
    queryKey: ["sequence-analytics"],
    queryFn: async () => {
      const { data: seqs } = await supabase
        .from("cart_recovery_sequences")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (!seqs) return [];

      // Get stats for each sequence
      const sequenceStats = await Promise.all(
        seqs.map(async (seq) => {
          const { data: carts } = await supabase
            .from("abandoned_carts")
            .select("status, cart_value, engagement_score")
            .eq("current_sequence", seq.sequence_name);

          const total = carts?.length || 0;
          const recovered = carts?.filter(c => c.status === 'recovered').length || 0;
          const conversionRate = total > 0 ? (recovered / total) * 100 : 0;
          const totalValue = carts?.reduce((sum, c) => sum + parseFloat(String(c.cart_value) || '0'), 0) || 0;
          const recoveredValue = carts
            ?.filter(c => c.status === 'recovered')
            .reduce((sum, c) => sum + parseFloat(String(c.cart_value) || '0'), 0) || 0;
          const avgEngagement = carts?.reduce((sum, c) => sum + parseFloat(String(c.engagement_score) || '0'), 0) / (total || 1);

          return {
            ...seq,
            totalCarts: total,
            recoveredCarts: recovered,
            conversionRate,
            totalValue,
            recoveredValue,
            avgEngagement: avgEngagement || 0
          };
        })
      );

      return sequenceStats;
    },
  });

  const chartData = sequences?.map(seq => ({
    name: seq.sequence_name.replace('_', ' '),
    conversion: seq.conversionRate,
    carts: seq.totalCarts
  })) || [];

  const pieData = sequences?.map(seq => ({
    name: seq.sequence_name.replace('_', ' '),
    value: seq.totalCarts
  })) || [];

  const totalCarts = sequences?.reduce((sum, s) => sum + s.totalCarts, 0) || 0;
  const totalRecovered = sequences?.reduce((sum, s) => sum + s.recoveredCarts, 0) || 0;
  const totalValue = sequences?.reduce((sum, s) => sum + s.recoveredValue, 0) || 0;
  const overallConversion = totalCarts > 0 ? (totalRecovered / totalCarts) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recovery Sequence Analytics</h1>
          <p className="text-muted-foreground">
            Performance metrics for behavioral follow-up sequences
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Carts in Sequences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{totalCarts}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{overallConversion.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Recovered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">{totalRecovered}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recovered Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold">{formatCurrency(totalValue)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate by Sequence</CardTitle>
              <CardDescription>Compare performance across sequences</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversion" fill="#8884d8" name="Conversion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cart Distribution</CardTitle>
              <CardDescription>Number of carts in each sequence</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sequence Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Sequence Performance</CardTitle>
            <CardDescription>Complete breakdown of each sequence</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Total Carts</TableHead>
                  <TableHead>Recovered</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Recovered Value</TableHead>
                  <TableHead>Avg Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sequences?.map((seq) => (
                  <TableRow key={seq.id}>
                    <TableCell className="font-medium">
                      {seq.sequence_name.replace('_', ' ').toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{seq.priority}</Badge>
                    </TableCell>
                    <TableCell>{seq.totalCarts}</TableCell>
                    <TableCell>{seq.recoveredCarts}</TableCell>
                    <TableCell>
                      <Badge variant={seq.conversionRate > 15 ? "default" : "secondary"}>
                        {seq.conversionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(seq.totalValue)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(seq.recoveredValue)}
                    </TableCell>
                    <TableCell>{seq.avgEngagement.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
