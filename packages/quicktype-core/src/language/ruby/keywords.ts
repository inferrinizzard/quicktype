export const keywords = [
    "__ENCODING__",
    "__FILE__",
    "__LINE__",
    "alias",
    "and",
    "begin",
    "BEGIN",
    "break",
    "case",
    "class",
    "def",
    "defined?",
    "do",
    "else",
    "elsif",
    "end",
    "END",
    "ensure",
    "false",
    "for",
    "if",
    "in",
    "module",
    "next",
    "nil",
    "not",
    "or",
    "redo",
    "rescue",
    "retry",
    "return",
    "self",
    "super",
    "then",
    "true",
    "undef",
    "unless",
    "until",
    "when",
    "while",
    "yield",
];

const globalClasses = [
    "ArgumentError",
    "Array",
    "BasicObject",
    "Class",
    "ClosedQueueError",
    "Comparable",
    "Complex",
    "ConditionVariable",
    "Continuation",
    "Data",
    "Date",
    "Dir",
    "ENV",
    "EOFError",
    "Encoding",
    "EncodingError",
    "Enumerable",
    "Enumerator",
    "Errno",
    "Exception",
    "FalseClass",
    "Fiber",
    "FiberError",
    "File",
    "FileTest",
    "Float",
    "FloatDomainError",
    "FrozenError",
    "GC",
    "Hash",
    "IO",
    "IOError",
    "IndexError",
    "Integer",
    "Interrupt",
    "KeyError",
    "LoadError",
    "LocalJumpError",
    "Marshal",
    "MatchData",
    "Math",
    "Method",
    "Module",
    "Mutex",
    "NameError",
    "NilClass",
    "NoMemoryError",
    "NoMethodError",
    "NotImplementedError",
    "Numeric",
    "Object",
    "ObjectSpace",
    "Proc",
    "Process",
    "Queue",
    "Random",
    "Range",
    "RangeError",
    "Rational",
    "Regexp",
    "RegexpError",
    "RubyVM",
    "RuntimeError",
    "ScriptError",
    "SecurityError",
    "Set",
    "Signal",
    "SignalException",
    "SizedQueue",
    "StandardError",
    "StopIteration",
    "String",
    "Struct",
    "Symbol",
    "SyntaxError",
    "SystemCallError",
    "SystemExit",
    "SystemStackError",
    "Thread",
    "ThreadError",
    "ThreadGroup",
    "Time",
    "TracePoint",
    "TrueClass",
    "TypeError",
    "UnboundMethod",
    "UncaughtThrowError",
    "Undefined",
    "UnicodeNormalize",
    "Warning",
    "ZeroDivisionError",
];

const kernel = [
    "__callee__",
    "__dir__",
    "__id__",
    "__method__",
    "__send__",
    "!",
    "!=",
    "!~",
    "<",
    "<=",
    "<=>",
    "==",
    "===",
    "=~",
    ">",
    ">=",
    "abort",
    "ancestors",
    "at_exit",
    "autoload",
    "autoload?",
    "binding",
    "block_given?",
    "caller",
    "caller_locations",
    "catch",
    "class",
    "class_eval",
    "class_exec",
    "class_variable_defined?",
    "class_variable_get",
    "class_variable_set",
    "class_variables",
    "clone",
    "const_defined?",
    "const_get",
    "const_missing",
    "const_set",
    "constants",
    "define_singleton_method",
    "deprecate_constant",
    "display",
    "dup",
    "enum_for",
    "eql?",
    "equal?",
    "eval",
    "exec",
    "exit",
    "exit!",
    "extend",
    "fail",
    "fork",
    "format",
    "freeze",
    "frozen?",
    "gets",
    "global_variables",
    "hash",
    "include",
    "include?",
    "included_modules",
    "inspect",
    "instance_eval",
    "instance_exec",
    "instance_method",
    "instance_methods",
    "instance_of?",
    "instance_variable_defined?",
    "instance_variable_get",
    "instance_variable_set",
    "instance_variables",
    "is_a?",
    "iterator?",
    "itself",
    "kind_of?",
    "lambda",
    "load",
    "local_variables",
    "loop",
    "method",
    "method_defined?",
    "methods",
    "module_eval",
    "module_exec",
    "name",
    "new",
    "nil?",
    "object_id",
    "open",
    "p",
    "prepend",
    "print",
    "printf",
    "private_class_method",
    "private_constant",
    "private_instance_methods",
    "private_method_defined?",
    "private_methods",
    "proc",
    "protected_instance_methods",
    "protected_method_defined?",
    "protected_methods",
    "public_class_method",
    "public_constant",
    "public_instance_method",
    "public_instance_methods",
    "public_method",
    "public_method_defined?",
    "public_methods",
    "public_send",
    "putc",
    "puts",
    "raise",
    "rand",
    "readline",
    "readlines",
    "remove_class_variable",
    "remove_instance_variable",
    "require",
    "require_relative",
    "respond_to?",
    "select",
    "send",
    "set_trace_func",
    "singleton_class",
    "singleton_class?",
    "singleton_method",
    "singleton_methods",
    "sleep",
    "spawn",
    "sprintf",
    "srand",
    "syscall",
    "system",
    "taint",
    "tainted?",
    "tap",
    "test",
    "throw",
    "to_enum",
    "to_s",
    "trace_var",
    "trap",
    "trust",
    "untaint",
    "untrace_var",
    "untrust",
    "untrusted?",
    "warn",
];

export const globals = kernel.concat(globalClasses);

export const reservedProperties = [
    "__id__",
    "__send__",
    "break",
    "call",
    "case",
    "class",
    "clone",
    "constrained_type",
    "constrained?",
    "constrained",
    "constructor",
    "default",
    "define_singleton_method",
    "display",
    "dup",
    "enum_for",
    "enum",
    "extend",
    "freeze",
    "gem",
    "hash",
    "inspect",
    "instance_eval",
    "instance_exec",
    "instance_variable_defined?",
    "instance_variable_get",
    "instance_variable_set",
    "instance_variables",
    "itself",
    "meta",
    "method",
    "methods",
    "next",
    "object_id",
    "optional",
    "options",
    "pristine",
    "private_methods",
    "protected_methods",
    "public_method",
    "public_methods",
    "public_send",
    "remove_instance_variable",
    "rule",
    "safe",
    "self",
    "send",
    "singleton_class",
    "singleton_method",
    "singleton_methods",
    "taint",
    "tap",
    "to_ast",
    "to_enum",
    "to_json",
    "to_s",
    "trust",
    "try",
    "type",
    "untaint",
    "undef",
    "untrust",
    "while",
    "with",
];
