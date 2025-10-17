"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import{ useEffect } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import
 { Select, 
    SelectContent,
     SelectItem,
     SelectTrigger,
      SelectValue } from "@/components/ui/select";
import { categoryColors } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { Clock,
    RefreshCw, 
    ChevronDown
    ,ChevronUp,
     Search, 
     Trash} from "lucide-react";


import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// import { recurringInterval } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useMemo } from "react";
import { de } from "date-fns/locale";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { BarLoader } from "react-spinners";

const RECURRING_INTERVALS = {
    DAILY : "Daily",
    WEEKLY : "Weekly",
    MONTHLY : "Monthly",
    YEARLY : "Yearly",
}


const TransactionTable = ({ transactions }) => {

    const router = useRouter(); 
    const [selectedIds, setSelectedIds] = useState([]);
    const[sortConfig, setSortConfig] = useState({
         field : "date",
         direction : "desc",
    });


const [searchTerm, setSearchTerm] = useState("");
const [typeFilter, setTypeFilter] = useState("");
const [recuringFilter, setRecuringFilter] = useState("");

const{
loading : deleteLoading,
fn : deleteFn,
data : deleted,
} = useFetch(bulkDeleteTransactions)




    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];
        // apply search Filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
            transaction.description?.toLowerCase().includes(searchLower)  
            );
        }

//apply recurring filter
            if(recuringFilter) {
                result = result.filter((transaction) =>{
                    if(recuringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            }
    )};
        
    //apply type filter
if(typeFilter){
    result = result.filter((transaction) => transaction.type === typeFilter);
}

//apply sorting
result.sort((a,b) =>{
    let comparison = 0;
    switch(sortConfig.field){
        case "date":
            comparison = new Date(a.date) - new Date(b.date);
            break;
        case "amount":
            comparison = a.amount - b.amount;
            break;
        case "category":
            comparison = a.category.localeCompare(b.category);
            break;
        default:
        comparison = 0;

    }
    return sortConfig.direction === "asc" ? comparison : -comparison;
})

        return result;
    },[
        transactions,
        searchTerm,
        typeFilter,
        sortConfig,
        recuringFilter,
    ]);

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction :
            current.field == field && current.direction === "asc" ? "desc"
: "asc" ,       }))
    };

const handleSelect = (id) => { 
    setSelectedIds((current) => current.includes(id) ? current.filter(item => item != id) :[...current,id])
 };


const handleSelectAll = () => { 
   setSelectedIds((current) => 
    current.length === filteredAndSortedTransactions.length
    ? [] : filteredAndSortedTransactions.map((t) => t.id)

   );
 };

const handleBulkDelete = async ()=>{
    if(
        !window.confirm(
            `Are you sure you want to delete ${selectedIds.length}  transactions?`
        )
    ) {
        return; 
    }
    deleteFn(selectedIds);
};

useEffect(() => {
    if(deleted && !deleteLoading) {
        toast.error("Transaction Deleted Successfully");
    }
},[deleted, deleteLoading]);


const handleClearFilter=() =>{
    setSearchTerm("");
    setTypeFilter("");
    setRecuringFilter("");  
    setSelectedIds([]);
};

    return (
        <div className="space-y-4">
           {deleteLoading && ( <BarLoader
            color="#9333ea"
            className="mt-4"
            width={"100%"} />)}

            {/* filters */}
            <div className="flex flex-col sm:flex-row gap-4" >
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className='pl-8' 
                     placeholder="Search transactions..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                    
                    />
                </div>
            
        <div className="flex gap-2">
<Select value={typeFilter} onValueChange={setTypeFilter} >
  <SelectTrigger>
    <SelectValue placeholder="All Types" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="INCOME">Income</SelectItem>
    <SelectItem value="EXPENSE">Expense</SelectItem>
  </SelectContent>
</Select>


<Select value={recuringFilter}
 onValueChange={(value) => setRecuringFilter(value)}
  >

  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="All Transactions" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="recurring">Recurrig Only</SelectItem>
    <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
  </SelectContent>
</Select>

{selectedIds.length > 0 && (
    <div>
        <Button variant='destructive' size='sm' 
        onClick={handleBulkDelete}
        >
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected ({selectedIds.length})</Button>
        </div>
)}
{(searchTerm || typeFilter || recuringFilter) && (

    <Button 
    variant='outline' size='sm' onClick={handleClearFilter} title='Clear Filters'
    ><X className='h-4 w-5'/>  </Button>
) }
        </div>
        </div>


        {/* transaction */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                onCheckedChange={handleSelectAll}
                                checked={selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}
                                />
                            </TableHead>

                            <TableHead className="cursor-pointer"
                            onClick={()=> handleSort("date")} >
                                <div className="flex items-center">Date{" "}
                                      {sortConfig.field === 'date' && ( sortConfig.direction === "asc" ? ( <ChevronUp className='ml-1 h-4 w-4' />
                                 ) : ( <ChevronDown className='ml-1 h-4 w-4' />
                                ) )} 
                                </div>
                            </TableHead>

                            <TableHead>
                                <div className="flex items-center">Description</div>
                            </TableHead>

                            <TableHead className="cursor-pointer " 
                            onClick={() => handleSort("category")}
                            > <div className="flex items-center">Category
                                {sortConfig.field === 'category' && ( sortConfig.direction === "asc" ? ( <ChevronUp className='ml-1 h-4 w-4' />
                                 ) : ( <ChevronDown className='ml-1 h-4 w-4' />
                                ) )} </div>
                            </TableHead>

                            <TableHead className="cursor-pointer" 
                            onClick={() =>handleSort("amount")}
                            >
                                <div className="flex items-center justify-end">Amount
                                 {sortConfig.field === 'amount' && ( sortConfig.direction === "asc" ? ( <ChevronUp className='ml-1 h-4 w-4' />
                                 ) : ( <ChevronDown className='ml-1 h-4 w-4' />
                                ) )}
                                    
                                </div>
                            </TableHead>
                            <TableHead>Recuring</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredAndSortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className='text-center text-muted-foreground'>
                                    NoTransaction Found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedTransactions.map((transaction) => (

                                <TableRow key={transaction.id} >
                                    <TableCell className="font-medium">
                                        <Checkbox onCheckedChange={() => handleSelect(transaction.id)} 
                                        checked={selectedIds.includes(transaction.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(transaction.date), "PP")}
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className='capitalize'>
                                        <span
                                            style={{
                                                background: categoryColors[transaction.category],

                                            }}
                                            className="px-2 py-1 rounded text-whitetext-sm  "
                                        > {transaction.category}  </span> </TableCell>
                                    <TableCell
                                        className="text-right font-medium"
                                        style={{
                                            color: transaction.type === "EXPENSE" ? "red" : "green",
                                        }}
                                    >
                                        {transaction.type === 'EXPENSE' ? "-" : '+'}$
                                        {transaction.amount.toFixed(2)}</TableCell>

                                        <TableCell>{transaction.isRecurring ?(
                                           <Tooltip>
  <TooltipTrigger>
 <Badge variant='outline'
 className='gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200'>
    <RefreshCw className='h-3 w-3' />
    {RECURRING_INTERVALS[
        transaction.recurringInterval
    ]}
 </Badge>



  </TooltipTrigger>
  <TooltipContent>
   <div>
    <div>Next Date:</div>
    <div>{format(new Date(transaction.nextRecurringDate),"PP")}</div>
   </div>
  </TooltipContent>
</Tooltip>
                                        ):( <Badge className='gap-1' variant='outline'>
                                            <Clock className="h-3 w-3" />
                                            One-time
                                            </Badge>
                                            )}
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant='ghost ' className='h-8 w-8 p-0'><MoreHorizontal 
    className='h-4 w-4'
    /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel  
    onClick={() => router.push(
        `/transaction/create?edit=${transaction.id}`
    )}
    >Edit</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className='text-destructive' 
    onClick={()=> deleteFn([transaction.id])}
    >Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
                                            </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default TransactionTable;


