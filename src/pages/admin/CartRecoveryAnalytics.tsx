import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ShoppingCart, TrendingUp, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function CartRecoveryAnalytics() {
  const { data: stats } = useQuery({
    queryKey: ["cart-recovery-analytics"],
    queryFn: async () => {
      const { data: carts } = await supabase
        .from("abandoned_carts")
        .select("*");

      const total = carts?.length || 0;
      const active = carts?.filter((c) => c.status === "active").length || 0;
      const recovered = carts?.filter((c) => c.status === "recovered").length || 0;
      const expired = carts?.filter((c) => c.status === "expired").length || 0;

      const totalValue = carts?.reduce((sum, c) => sum + Number(c.cart_value), 0) || 0;
      const recoveredValue = carts?.filter((c) => c.status === "recovered").reduce((sum, c) => sum + Number(c.cart_value), 0) || 0;

      // Stage breakdown
      const stageData = [
        { name: "Cart", value: carts?.filter((c) => c.abandonment_stage === "cart").length || 0 },
        { name: "Checkout", value: carts?.filter((c) => c.abandonment_stage === "checkout_started").length || 0 },
        { name: "Info Entered", value: carts?.filter((c) => c.abandonment_stage === "checkout_info_entered").length || 0 },
        { name: "Payment Failed", value: carts?.filter((c) => c.abandonment_stage === "payment_failed").length || 0 },
      ];

      // Recovery by day
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const recoveryByDay = last7Days.map((date) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        abandoned: carts?.filter((c) => c.abandoned_at.startsWith(date)).length || 0,
        recovered: carts?.filter((c) => c.recovered_at?.startsWith(date)).length || 0,
      }));

      return {
        total,
        active,
        recovered,
        expired,
        totalValue,
        recoveredValue,
        recoveryRate: total > 0 ? (recovered / total) * 100 : 0,
        stageData,
        recoveryByDay,
      };
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto py-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Cart Recovery Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into abandoned cart performance
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Abandoned</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.active || 0} currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.recoveryRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.recovered || 0} carts recovered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All abandoned carts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovered Value</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.recoveredValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue recovered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recovery Trend */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Recovery Trend</CardTitle>
                <CardDescription>Abandoned vs recovered carts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.recoveryByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="abandoned"
                      stroke="hsl(var(--destructive))"
                      name="Abandoned"
                    />
                    <Line
                      type="monotone"
                      dataKey="recovered"
                      stroke="hsl(var(--primary))"
                      name="Recovered"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stage Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Abandonment Stage Breakdown</CardTitle>
                <CardDescription>Where customers are dropping off</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.stageData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {stats?.stageData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-semibold">{stats?.active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Recovered</span>
                    <span className="font-semibold text-primary">{stats?.recovered || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expired</span>
                    <span className="font-semibold">{stats?.expired || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Cart Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(
                    stats && stats.total > 0 ? stats.totalValue / stats.total : 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Across all abandoned carts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {stats && stats.totalValue > 0
                    ? ((stats.recoveredValue / stats.totalValue) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Of at-risk revenue recovered
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
