import ExcelJS from "exceljs";
import type { MonthlyReportData } from "./monthly-report-data";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "—";
  return amount.toLocaleString("en-ET", { maximumFractionDigits: 2 });
}

function styleHeaderRow(sheet: ExcelJS.Worksheet, rowNumber: number) {
  const row = sheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF047857" },
  };
}

function addSummarySheet(workbook: ExcelJS.Workbook, data: MonthlyReportData) {
  const sheet = workbook.addWorksheet("Summary");
  sheet.columns = [
    { header: "Field", key: "field", width: 28 },
    { header: "Value", key: "value", width: 40 },
  ];
  styleHeaderRow(sheet, 1);

  const rows: [string, string][] = [
    ["Report period", data.periodLabel],
    ["Account", data.userName],
    ["Generated", formatDate(data.generatedAt)],
    ["", ""],
    ["Monthly budget (ETB)", data.hasBudget ? formatAmount(data.budgetIncome) : "Not set"],
    ["Logged income (ETB)", formatAmount(data.loggedIncome)],
    ["Total spent (ETB)", formatAmount(data.totalSpent)],
    ["Remaining (ETB)", formatAmount(data.remaining)],
    ["Savings goal (ETB)", formatAmount(data.savingsGoal)],
    ["Expense transactions", String(data.expenses.length)],
    ["Income entries", String(data.income.length)],
  ];

  if (data.warnings.length) {
    rows.push(["", ""]);
    rows.push(["Budget alerts", data.warnings.join("; ")]);
  }

  for (const [field, value] of rows) {
    sheet.addRow({ field, value });
  }
}

function addCategorySheet(workbook: ExcelJS.Workbook, data: MonthlyReportData) {
  const sheet = workbook.addWorksheet("By category");
  sheet.columns = [
    { header: "Category", key: "category", width: 22 },
    { header: "Spent (ETB)", key: "spent", width: 14 },
    { header: "Limit (ETB)", key: "limit", width: 14 },
    { header: "% of limit", key: "percent", width: 12 },
    { header: "Over budget", key: "over", width: 12 },
  ];
  styleHeaderRow(sheet, 1);

  if (!data.categoryRows.length) {
    sheet.addRow({
      category: "No spending recorded",
      spent: "",
      limit: "",
      percent: "",
      over: "",
    });
    return;
  }

  for (const row of data.categoryRows) {
    sheet.addRow({
      category: row.name,
      spent: row.spent,
      limit: row.limit ?? "",
      percent: row.percentOfLimit != null ? `${row.percentOfLimit}%` : "",
      over: row.overBudget ? "Yes" : "No",
    });
  }
}

function addExpensesSheet(workbook: ExcelJS.Workbook, data: MonthlyReportData) {
  const sheet = workbook.addWorksheet("Expenses");
  sheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Category", key: "category", width: 20 },
    { header: "Description", key: "description", width: 36 },
    { header: "Amount (ETB)", key: "amount", width: 14 },
  ];
  styleHeaderRow(sheet, 1);

  if (!data.expenses.length) {
    sheet.addRow({
      date: "",
      category: "No expenses this month",
      description: "",
      amount: "",
    });
    return;
  }

  for (const row of data.expenses) {
    sheet.addRow({
      date: formatDate(row.date),
      category: row.category,
      description: row.description ?? "",
      amount: row.amount,
    });
  }
}

function addIncomeSheet(workbook: ExcelJS.Workbook, data: MonthlyReportData) {
  const sheet = workbook.addWorksheet("Income");
  sheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Source", key: "source", width: 20 },
    { header: "Description", key: "description", width: 36 },
    { header: "Amount (ETB)", key: "amount", width: 14 },
  ];
  styleHeaderRow(sheet, 1);

  if (!data.income.length) {
    sheet.addRow({
      date: "",
      source: "No income logged this month",
      description: "",
      amount: "",
    });
    return;
  }

  for (const row of data.income) {
    sheet.addRow({
      date: formatDate(row.date),
      source: row.source,
      description: row.description ?? "",
      amount: row.amount,
    });
  }
}

function addPlanningSheet(workbook: ExcelJS.Workbook, data: MonthlyReportData) {
  const sheet = workbook.addWorksheet("Planning goals");
  sheet.columns = [
    { header: "Goal", key: "title", width: 28 },
    { header: "Target (ETB)", key: "target", width: 14 },
    { header: "Saved (ETB)", key: "saved", width: 14 },
    { header: "Progress", key: "percent", width: 12 },
    { header: "Status", key: "status", width: 12 },
  ];
  styleHeaderRow(sheet, 1);

  if (!data.planningGoals.length) {
    sheet.addRow({
      title: "No planning goals",
      target: "",
      saved: "",
      percent: "",
      status: "",
    });
    return;
  }

  for (const row of data.planningGoals) {
    sheet.addRow({
      title: row.title,
      target: row.targetAmount,
      saved: row.savedTotal,
      percent: `${row.percent}%`,
      status: row.status,
    });
  }
}

export async function buildMonthlyReportXlsx(
  data: MonthlyReportData,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Smart Birr";
  workbook.created = data.generatedAt;

  addSummarySheet(workbook, data);
  addCategorySheet(workbook, data);
  addExpensesSheet(workbook, data);
  addIncomeSheet(workbook, data);
  addPlanningSheet(workbook, data);

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
