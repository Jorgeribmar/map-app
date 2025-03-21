import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Error } from '@mui/icons-material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to your preferred error tracking service
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        p: 3,
                        textAlign: 'center'
                    }}
                >
                    <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Oops! Something went wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleReset}
                    >
                        Try Again
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 