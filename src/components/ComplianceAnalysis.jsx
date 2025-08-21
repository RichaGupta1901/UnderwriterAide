import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText, Shield, TrendingUp } from 'lucide-react';

const ComplianceAnalysis = ({ complianceData, onRunCheck }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsAnalyzing(true);

    try {
      await onRunCheck(file);
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partially compliant':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'not compliant':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'partially compliant':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'not compliant':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">APRA Compliance Analysis</h3>
        </div>

        {/* File Upload for Compliance Check */}
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isAnalyzing}
            className="hidden"
            id="compliance-file-upload"
          />
          <label
            htmlFor="compliance-file-upload"
            className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
              isAnalyzing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Upload Policy for Check'}
          </label>
        </div>
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing policy compliance...</span>
        </div>
      )}

      {complianceData && !isAnalyzing && (
        <>
          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {complianceData.overall_compliance_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {complianceData.summary?.compliant || 0}
              </div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {complianceData.summary?.partially_compliant || 0}
              </div>
              <div className="text-sm text-gray-600">Partial</div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {complianceData.summary?.non_compliant || 0}
              </div>
              <div className="text-sm text-gray-600">Non-Compliant</div>
            </div>
          </div>

          {/* Compliance Results */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Detailed Requirements Analysis</h4>

            {complianceData.compliance_results?.map((requirement, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getStatusColor(requirement.status)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(requirement.status)}
                    <div>
                      <h5 className="font-semibold text-sm">{requirement.requirement_id}</h5>
                      <p className="text-xs text-gray-600 mt-1">{requirement.requirement_text}</p>
                    </div>
                  </div>

                  {requirement.risk_level && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(requirement.risk_level)}`}>
                      {requirement.risk_level} Risk
                    </span>
                  )}
                </div>

                {requirement.evidence && (
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border-l-4 border-blue-300">
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Evidence Found:</h6>
                    <p className="text-sm text-gray-600 italic">"{requirement.evidence}"</p>
                  </div>
                )}

                {requirement.gaps_identified && requirement.gaps_identified.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Gaps Identified:</h6>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {requirement.gaps_identified.map((gap, gapIndex) => (
                        <li key={gapIndex}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {requirement.recommendations && requirement.recommendations.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h6>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {requirement.recommendations.map((rec, recIndex) => (
                        <li key={recIndex}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {requirement.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>Notes:</strong> {requirement.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Analysis Metadata */}
          {complianceData.analysis_metadata && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis Details</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Analyzed:</span>
                  <br />
                  {new Date(complianceData.analysis_metadata.timestamp).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Text Length:</span>
                  <br />
                  {complianceData.analysis_metadata.text_length?.toLocaleString()} chars
                </div>
                <div>
                  <span className="font-medium">Checklist Version:</span>
                  <br />
                  {complianceData.analysis_metadata.checklist_version}
                </div>
                <div>
                  <span className="font-medium">AI Model:</span>
                  <br />
                  {complianceData.analysis_metadata.analysis_model}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Data State */}
      {!complianceData && !isAnalyzing && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Compliance Analysis Yet</h4>
          <p className="text-gray-500 mb-4">
            Upload a policy document to run APRA compliance analysis
          </p>
        </div>
      )}

      {/* Error State */}
      {complianceData?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <h5 className="font-medium text-red-800">Analysis Failed</h5>
          </div>
          <p className="text-red-700 mt-2">{complianceData.error}</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceAnalysis;