import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye } from "lucide-react";

export default function Admin() {
  const [properties] = useState([
    { 
      id: 1,
      name: "Luxury Villa",
      location: "San Francisco, California",
      value: "USD 1,000,000",
      yield: "12%",
      isApproved: false
    },
    { 
      id: 2,
      name: "Beach House",
      location: "San Francisco, California",
      value: "USD 1,000,000",
      yield: "12%",
      isApproved: true
    },
  ]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  function getStatus(status) {
    return status === true ? "Approved" : status === false ? "Pending" : "Rejected";
  }

  const handleApprove = (index) => {
    console.log("Approve clicked for index:", index);
  };

  const handleReject = (id) => {
    console.log("Reject clicked for id:", id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Content Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Video Link</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>San Francisco, California</TableCell>
                  <TableCell>USD 1,000,000</TableCell>
                  <TableCell>12%</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.isApproved === true
                          ? "bg-green-100 text-green-800"
                          : property.isApproved === false
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatus(property.isApproved)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProperty(property)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(index)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReject(property.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
