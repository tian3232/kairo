<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Comment;
use App\Models\CommentReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $query = Comment::with(['user', 'anime', 'episode.season.anime', 'profileUser']);

        if ($request->status === 'hidden') {
            $query->where('is_visible', false);
        } elseif ($request->status === 'visible') {
            $query->where('is_visible', true);
        }

        $comments = $query->latest()->paginate(20);

        return Inertia::render('admin/comments/index', [
            'comments' => $comments,
            'filters' => $request->only('status'),
        ]);
    }

    public function reports(Request $request)
    {
        $query = CommentReport::with(['comment.user', 'user'])
            ->where('status', 'pending');

        $reports = $query->latest()->paginate(20);

        return Inertia::render('admin/comments/reports', [
            'reports' => $reports,
        ]);
    }

    public function dismissReport(CommentReport $report)
    {
        $report->update(['status' => 'dismissed']);
        return redirect()->back()->with('success', 'Reporte descartado.');
    }

    public function resolveReport(CommentReport $report)
    {
        $comment = $report->comment;
        if ($comment) {
            $old = ['is_visible' => $comment->is_visible];
            $comment->update(['is_visible' => false]);
            AuditLog::log('comment.hidden_by_report', $comment, $old, ['is_visible' => false]);
        }

        $report->update(['status' => 'reviewed']);
        return redirect()->back()->with('success', 'Comentario oculto y reporte resuelto.');
    }

    public function toggleVisibility(Comment $comment)
    {
        $old = ['is_visible' => $comment->is_visible];
        $comment->update(['is_visible' => !$comment->is_visible]);

        AuditLog::log('comment.toggled', $comment, $old, ['is_visible' => $comment->is_visible]);

        return redirect()->back()->with('success', $comment->is_visible ? 'Comentario visible.' : 'Comentario oculto.');
    }

    public function destroy(Comment $comment)
    {
        $old = $comment->toArray();
        AuditLog::log('comment.deleted', $comment, $old, null);
        $comment->delete();

        return redirect()->back()->with('success', 'Comentario eliminado.');
    }
}
