import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Analystic.css";

const Analystic = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await axios.get("/admin/bookings/statistics");
  //         console.log(response);

  //         // const jsonData = await response.json();
  //         setData(response);
  //         setLoading(false);
  //       } catch (err) {
  //         setError(err.message);
  //         setLoading(false);
  //       }
  //     };

  //     fetchData();
  //   }, []);
  useEffect(() => {
    // Simulate API fetch
    const mockData = {
      product_stats: [
        {
          _id: "1",
          product_name: "iPhone 13",
          category: "Phone",
          total_stock: 50,
          total_sold: 30,
          revenue: 450000000,
        },
        {
          _id: "2",
          product_name: "Samsung TV 55inch",
          category: "TV",
          total_stock: 20,
          total_sold: 15,
          revenue: 300000000,
        },
        {
          _id: "3",
          product_name: "Sony Headphones",
          category: "Accessories",
          total_stock: 100,
          total_sold: 40,
          revenue: 80000000,
        },
      ],
      monthly_revenue: [
        { _id: { month: "01", year: "2025" }, revenue: 30000000, sales: 5 },
        { _id: { month: "02", year: "2025" }, revenue: 150000000, sales: 25 },
        { _id: { month: "03", year: "2025" }, revenue: 120000000, sales: 20 },
        { _id: { month: "04", year: "2025" }, revenue: 100000000, sales: 18 },
        { _id: { month: "05", year: "2025" }, revenue: 200000000, sales: 35 },
      ],
      summary: {
        total_products: 3,
        total_sales: 148,
        total_revenue: 700000000,
        best_selling_product: {
          product_name: "iPhone 13",
          total_sold: 30,
          revenue: 450000000,
        },
      },
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatRevenue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${(value / 1000).toFixed(1)}K`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">No data available</div>;
  }

  const monthlyRevenueData = data.monthly_revenue.map((item) => ({
    month: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    sales: item.sales,
  }));

  const productRankingData = data.product_stats
    .map((product) => ({
      name: product.product_name,
      revenue: product.revenue,
      sold: product.total_sold,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="statistics-dashboard">
      <div className="section-container section-container--two-cols">
        <div className="card">
          <h3 className="card__header">Monthly Revenue</h3>
          <div className="card__chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatRevenue} />
                <Tooltip
                  formatter={(value) => formatRevenue(value)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card__header">Top Products by Revenue</h3>
          <div className="card__chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productRankingData}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, revenue }) =>
                    `${name} (${formatRevenue(revenue)})`
                  }
                >
                  {productRankingData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRevenue(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section-container section-container--three-cols">
        <div className="card" style={{ backgroundColor: "#01bff2" }}>
          <h4 className="card__stat-title">Total Units Sold</h4>
          <p className="card__stat-value">{data.summary.total_sales}</p>
        </div>
        <div className="card" style={{ backgroundColor: "#bd3f30" }}>
          <h4 className="card__stat-title">Total Revenue</h4>
          <p className="card__stat-value">
            {formatRevenue(data.summary.total_revenue)}
          </p>
        </div>
        <div className="card" style={{ backgroundColor: "#f2a00f" }}>
          <h4 className="card__stat-title">Number of Products</h4>
          <p className="card__stat-value">{data.summary.total_products}</p>
        </div>
      </div>
    </div>
  );
};
import "./Analystic.css";
export default Analystic;
