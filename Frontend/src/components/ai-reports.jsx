
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import MarkdownRenderer from '@/utils/markdown-renderer';

const AIReports = ({ reports }) => {
    const [sortOrder, setSortOrder] = useState('desc');

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedReports = [...reports].sort((a, b) => {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>AI Reports</CardTitle>
                    <Button onClick={toggleSortOrder} variant="outline" size="sm">
                        Sort {sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {sortedReports.length > 0 ? (
                    <ul className="space-y-4">
                        {sortedReports.map((report) => (
                            <li key={report.id}>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            <span>Report #{report.id}</span>
                                            <span>{format(new Date(), 'PPP')}</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Financial Report #{report.id}</DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="flex-grow">
                                            <div className="p-4">
                                                <MarkdownRenderer content={report.content} />
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No AI reports available at the moment.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AIReports;