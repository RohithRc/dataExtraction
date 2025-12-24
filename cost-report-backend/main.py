from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.report_exporter import generate_pdf, generate_docx, create_pdf_from_elements, create_docx_from_elements
from services.markdown_parser import parse_markdown_to_elements
from data.dummy_report import REPORT_META, TABLE_HEADERS, TABLE_DATA
from models import CostReport

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_dummy_metadata():
    return [
        f"Management Account: {REPORT_META['management_account']} ({REPORT_META['billing_type']})",
        f"Total Organization Cost: {REPORT_META['total_cost']}"
    ]

@app.post("/convert/pdf")
async def convert_to_pdf(file: UploadFile = File(...)):
    content = await file.read()
    elements = parse_markdown_to_elements(content.decode("utf-8"))
    return create_pdf_from_elements(elements)

@app.post("/convert/docx")
async def convert_to_docx(file: UploadFile = File(...)):
    content = await file.read()
    elements = parse_markdown_to_elements(content.decode("utf-8"))
    return create_docx_from_elements(elements)

@app.get("/export/pdf")
def export_pdf():
    return generate_pdf(
        "PER-ACCOUNT COST ANALYSIS", 
        get_dummy_metadata(), 
        TABLE_HEADERS, 
        TABLE_DATA
    )

@app.get("/export/docx")
def export_docx():
    return generate_docx(
        "PER-ACCOUNT COST ANALYSIS", 
        get_dummy_metadata(), 
        TABLE_HEADERS, 
        TABLE_DATA
    )

@app.post("/report/custom/pdf")
def custom_report_pdf(report: CostReport):
    metadata = [
        f"Generated At: {report.generatedAt}",
        f"Account: {report.account}",
        f"Time Range: {report.timeRange}",
        f"Total Cost: ${report.totalCost}",
        f"Summary: {report.summary}"
    ]
    
    headers = ["Service Name", "Cost", "Recommendation"]
    rows = [[s.name, f"${s.cost}", s.recommendation] for s in report.services]
    
    return generate_pdf(report.title, metadata, headers, rows)

@app.post("/report/custom/docx")
def custom_report_docx(report: CostReport):
    metadata = [
        f"Generated At: {report.generatedAt}",
        f"Account: {report.account}",
        f"Time Range: {report.timeRange}",
        f"Total Cost: ${report.totalCost}",
        f"Summary: {report.summary}"
    ]
    
    headers = ["Service Name", "Cost", "Recommendation"]
    rows = [[s.name, f"${s.cost}", s.recommendation] for s in report.services]
    
    return generate_docx(report.title, metadata, headers, rows)